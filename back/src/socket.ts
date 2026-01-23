import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { firestore } from './config/firebase';

// Types
interface Player {
  id: string;
  name: string;
  score: number;
  answers: number[];
}

interface Room {
  code: string;
  quizId: string;
  ownerId: string;
  ownerSocketId: string | null;
  players: Map<string, Player>;
  state: 'lobby' | 'playing' | 'finished';
  currentQuestionIndex: number;
  timerSeconds: number;
  timerInterval: NodeJS.Timeout | null;
  questions: any[];
  timePerQuestion: number;
}

// In-memory rooms storage
const rooms = new Map<string, Room>();

// Generate unique room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Create a new room
    socket.on('createRoom', async (data: { quizId: string; userId: string }, callback) => {
      try {
        // Fetch quiz from Firebase
        const quizDoc = await firestore.collection('quizzes').doc(data.quizId).get();
        if (!quizDoc.exists) {
          return callback({ error: 'Quiz non trouvé' });
        }

        const quizData = quizDoc.data();
        const code = generateRoomCode();

        const room: Room = {
          code,
          quizId: data.quizId,
          ownerId: data.userId,
          ownerSocketId: socket.id,
          players: new Map(),
          state: 'lobby',
          currentQuestionIndex: 0,
          timerSeconds: 0,
          timerInterval: null,
          questions: quizData?.questions || [],
          timePerQuestion: quizData?.timePerQuestion || 30,
        };

        rooms.set(code, room);
        socket.join(code);

        console.log(`📦 Room created: ${code} for quiz ${data.quizId}`);
        callback({ success: true, roomCode: code, quizTitle: quizData?.title });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ error: 'Erreur lors de la création de la room' });
      }
    });

    // Join a room as player
    socket.on('joinRoom', (data: { roomCode: string; playerName: string }, callback) => {
      const room = rooms.get(data.roomCode);
      
      if (!room) {
        return callback({ error: 'Room non trouvée' });
      }

      if (room.state !== 'lobby') {
        return callback({ error: 'Le quiz a déjà commencé' });
      }

      const player: Player = {
        id: socket.id,
        name: data.playerName,
        score: 0,
        answers: [],
      };

      room.players.set(socket.id, player);
      socket.join(data.roomCode);

      // Notify everyone in the room
      const playersList = Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, score: p.score }));
      io.to(data.roomCode).emit('playersUpdate', playersList);

      console.log(`👤 ${data.playerName} joined room ${data.roomCode}`);
      callback({ success: true, players: playersList });
    });

    // Owner rejoins room
    socket.on('rejoinAsOwner', (data: { roomCode: string; userId: string }, callback) => {
      const room = rooms.get(data.roomCode);
      
      if (!room) {
        return callback({ error: 'Room non trouvée' });
      }

      if (room.ownerId !== data.userId) {
        return callback({ error: 'Vous n\'êtes pas le propriétaire de cette room' });
      }

      room.ownerSocketId = socket.id;
      socket.join(data.roomCode);

      const playersList = Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, score: p.score }));
      callback({ 
        success: true, 
        players: playersList,
        state: room.state,
        currentQuestionIndex: room.currentQuestionIndex,
        questions: room.questions,
      });
    });

    // Start the quiz
    socket.on('startQuiz', (data: { roomCode: string }) => {
      const room = rooms.get(data.roomCode);
      
      if (!room || room.ownerSocketId !== socket.id) {
        return;
      }

      if (room.state !== 'lobby') {
        return;
      }

      room.state = 'playing';
      room.currentQuestionIndex = 0;
      
      const question = room.questions[0];
      const questionForPlayers = {
        question: question.question,
        options: question.options,
        index: 0,
        total: room.questions.length,
      };

      io.to(data.roomCode).emit('quizStarted', { question: questionForPlayers });
      
      // Start timer
      startTimer(io, room);
    });

    // Submit answer
    socket.on('submitAnswer', (data: { roomCode: string; answerIndex: number }) => {
      const room = rooms.get(data.roomCode);
      
      if (!room || room.state !== 'playing') {
        return;
      }

      const player = room.players.get(socket.id);
      if (!player) {
        return;
      }

      // Only record if not already answered this question
      if (player.answers[room.currentQuestionIndex] === undefined) {
        player.answers[room.currentQuestionIndex] = data.answerIndex;

        const currentQuestion = room.questions[room.currentQuestionIndex];
        if (data.answerIndex === currentQuestion.correctAnswer) {
          // Score calculation: 1000 points max (instant) to 700 points min (last second)
          // Linear interpolation based on time remaining
          const MAX_SCORE = 1000;
          const MIN_SCORE = 700;
          const timeElapsed = room.timePerQuestion - room.timerSeconds;
          const timeRatio = Math.max(0, Math.min(1, timeElapsed / room.timePerQuestion));
          // timeRatio = 0 → answered instantly → MAX_SCORE
          // timeRatio = 1 → answered at last second → MIN_SCORE
          const points = Math.round(MAX_SCORE - (timeRatio * (MAX_SCORE - MIN_SCORE)));
          player.score += points;
        }

        // Count how many players have answered
        const answeredCount = Array.from(room.players.values())
          .filter(p => p.answers[room.currentQuestionIndex] !== undefined).length;
        
        // Notify owner of answer count
        io.to(room.ownerSocketId!).emit('answerReceived', { 
          playerId: socket.id,
          answeredCount,
          totalPlayers: room.players.size,
        });

        // If all players have answered, trigger early reveal
        if (answeredCount >= room.players.size && room.players.size > 0) {
          // Clear the timer
          if (room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
          }

          // Reveal answer immediately
          const playerScores = Array.from(room.players.values())
            .map(p => ({ id: p.id, name: p.name, score: p.score }))
            .sort((a, b) => b.score - a.score);

          io.to(room.code).emit('timerEnd', {
            correctAnswer: currentQuestion.correctAnswer,
            explanation: currentQuestion.explanation,
            scores: playerScores,
          });
        }
      }
    });

    // Next question
    socket.on('nextQuestion', (data: { roomCode: string }) => {
      const room = rooms.get(data.roomCode);
      
      if (!room || room.ownerSocketId !== socket.id) {
        return;
      }

      // Clear timer
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
      }

      room.currentQuestionIndex++;

      if (room.currentQuestionIndex >= room.questions.length) {
        // Quiz finished
        room.state = 'finished';
        const finalScores = Array.from(room.players.values())
          .map(p => ({ id: p.id, name: p.name, score: p.score }))
          .sort((a, b) => b.score - a.score);
        
        io.to(data.roomCode).emit('quizEnded', { scores: finalScores });
      } else {
        const question = room.questions[room.currentQuestionIndex];
        const questionForPlayers = {
          question: question.question,
          options: question.options,
          index: room.currentQuestionIndex,
          total: room.questions.length,
        };

        io.to(data.roomCode).emit('newQuestion', { question: questionForPlayers });
        startTimer(io, room);
      }
    });

    // Get room info
    socket.on('getRoomInfo', (data: { roomCode: string }, callback) => {
      const room = rooms.get(data.roomCode);
      
      if (!room) {
        return callback({ error: 'Room non trouvée' });
      }

      const playersList = Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, score: p.score }));
      callback({
        success: true,
        state: room.state,
        players: playersList,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions.length,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);

      // Remove player from all rooms they were in
      rooms.forEach((room, code) => {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          const playersList = Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, score: p.score }));
          io.to(code).emit('playersUpdate', playersList);
        }

        // If owner disconnected, notify players
        if (room.ownerSocketId === socket.id) {
          room.ownerSocketId = null;
          io.to(code).emit('ownerDisconnected');
        }
      });
    });
  });

  return io;
}

// Timer management
function startTimer(io: Server, room: Room) {
  room.timerSeconds = room.timePerQuestion;

  room.timerInterval = setInterval(() => {
    room.timerSeconds--;
    io.to(room.code).emit('timerTick', { seconds: room.timerSeconds });

    if (room.timerSeconds <= 0) {
      clearInterval(room.timerInterval!);
      room.timerInterval = null;

      // Reveal answer
      const currentQuestion = room.questions[room.currentQuestionIndex];
      const playerScores = Array.from(room.players.values())
        .map(p => ({ id: p.id, name: p.name, score: p.score }))
        .sort((a, b) => b.score - a.score);

      io.to(room.code).emit('timerEnd', {
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        scores: playerScores,
      });
    }
  }, 1000);
}
