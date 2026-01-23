import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://10.101.25.78:3001';

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Question = {
  question: string;
  options: string[];
  index: number;
  total: number;
};

export type RoomState = 'connecting' | 'lobby' | 'playing' | 'reveal' | 'finished';

export type TimerEndData = {
  correctAnswer: number;
  explanation?: string;
  scores: Player[];
};

export type QuizEndData = {
  scores: Player[];
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomState, setRoomState] = useState<RoomState>('connecting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(0);
  const [revealData, setRevealData] = useState<TimerEndData | null>(null);
  const [finalScores, setFinalScores] = useState<Player[] | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizTitle, setQuizTitle] = useState<string>('');

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setConnected(false);
    });

    socket.on('playersUpdate', (playersList: Player[]) => {
      setPlayers(playersList);
    });

    socket.on('quizStarted', (data: { question: Question }) => {
      setRoomState('playing');
      setCurrentQuestion(data.question);
      setRevealData(null);
      setAnsweredCount(0);
    });

    socket.on('newQuestion', (data: { question: Question }) => {
      setRoomState('playing');
      setCurrentQuestion(data.question);
      setRevealData(null);
      setAnsweredCount(0);
    });

    socket.on('timerTick', (data: { seconds: number }) => {
      setTimer(data.seconds);
    });

    socket.on('timerEnd', (data: TimerEndData) => {
      setRoomState('reveal');
      setRevealData(data);
      setPlayers(data.scores);
    });

    socket.on('answerReceived', (data: { answeredCount: number }) => {
      setAnsweredCount(data.answeredCount);
    });

    socket.on('quizEnded', (data: QuizEndData) => {
      setRoomState('finished');
      setFinalScores(data.scores);
    });

    socket.on('ownerDisconnected', () => {
      setError('Le propriétaire s\'est déconnecté');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Create a room (for owner)
  const createRoom = useCallback((quizId: string, userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket non connecté'));
        return;
      }

      socketRef.current.emit('createRoom', { quizId, userId }, (response: any) => {
        if (response.error) {
          setError(response.error);
          reject(new Error(response.error));
        } else {
          setRoomCode(response.roomCode);
          setQuizTitle(response.quizTitle || '');
          setIsOwner(true);
          setRoomState('lobby');
          resolve(response.roomCode);
        }
      });
    });
  }, []);

  // Join a room (for player)
  const joinRoom = useCallback((code: string, playerName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket non connecté'));
        return;
      }

      socketRef.current.emit('joinRoom', { roomCode: code, playerName }, (response: any) => {
        if (response.error) {
          setError(response.error);
          reject(new Error(response.error));
        } else {
          setRoomCode(code);
          setPlayers(response.players);
          setIsOwner(false);
          setRoomState('lobby');
          resolve();
        }
      });
    });
  }, []);

  // Start the quiz (owner only)
  const startQuiz = useCallback(() => {
    if (!socketRef.current || !roomCode || !isOwner) return;
    socketRef.current.emit('startQuiz', { roomCode });
  }, [roomCode, isOwner]);

  // Submit answer (player only)
  const submitAnswer = useCallback((answerIndex: number) => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('submitAnswer', { roomCode, answerIndex });
  }, [roomCode]);

  // Next question (owner only)
  const nextQuestion = useCallback(() => {
    if (!socketRef.current || !roomCode || !isOwner) return;
    socketRef.current.emit('nextQuestion', { roomCode });
  }, [roomCode, isOwner]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connected,
    roomCode,
    players,
    roomState,
    currentQuestion,
    timer,
    revealData,
    finalScores,
    isOwner,
    error,
    answeredCount,
    quizTitle,
    createRoom,
    joinRoom,
    startQuiz,
    submitAnswer,
    nextQuestion,
    clearError,
  };
}
