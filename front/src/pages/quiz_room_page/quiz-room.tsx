import { useState, useEffect } from 'react';
import { useSocket, type Player, type Question, type TimerEndData } from '../../hooks/useSocket';
import { getMyQuizzes } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { QuizData } from '../../components/types';
import { QRCodeSVG } from 'qrcode.react';
import './quiz-room.css';

type ViewMode = 'select' | 'create' | 'join' | 'room';

type Props = {
  initialRoomCode?: string;
};

export default function QuizRoomPage({ initialRoomCode }: Props) {
  const { user } = useAuth();
  const socket = useSocket();
  const [viewMode, setViewMode] = useState<ViewMode>(() => initialRoomCode ? 'join' : 'select');
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState(initialRoomCode || '');
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Load user's quizzes
  useEffect(() => {
    if (user && viewMode === 'create') {
      setLoading(true);
      getMyQuizzes()
        .then((data) => setQuizzes(data.quizzes))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, viewMode]);

  // Reset answer state when new question arrives
  useEffect(() => {
    if (socket.roomState === 'playing') {
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  }, [socket.currentQuestion?.index, socket.roomState]);

  const handleCreateRoom = async () => {
    if (!selectedQuizId || !user) return;
    setLoading(true);
    try {
      await socket.createRoom(selectedQuizId, user.uid);
      setViewMode('room');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode || !playerName) return;
    setLoading(true);
    try {
      await socket.joinRoom(joinCode.toUpperCase(), playerName);
      setViewMode('room');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (hasAnswered || socket.roomState !== 'playing') return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    socket.submitAnswer(index);
  };

  // Selection view
  if (viewMode === 'select') {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Quiz Interactif</h1>
          <p className="arena-page__subtitle">Créez ou rejoignez une partie en temps réel</p>
        </header>

        <div className="qr-select">
          {user && (
            <button className="qr-select__btn qr-select__btn--create" onClick={() => setViewMode('create')}>
              <span className="qr-select__icon">🎮</span>
              <span className="qr-select__label">Créer une partie</span>
              <span className="qr-select__sub">Hébergez un quiz pour vos amis</span>
            </button>
          )}
          <button className="qr-select__btn qr-select__btn--join" onClick={() => setViewMode('join')}>
            <span className="qr-select__icon">🎯</span>
            <span className="qr-select__label">Rejoindre une partie</span>
            <span className="qr-select__sub">Entrez le code de la room</span>
          </button>
        </div>
      </section>
    );
  }

  // Create room view
  if (viewMode === 'create') {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Créer une partie</h1>
          <p className="arena-page__subtitle">Sélectionnez un quiz à lancer</p>
        </header>

        <div className="arena-panel qr-create">
          <button className="qr-back" onClick={() => setViewMode('select')}>← Retour</button>

          {loading ? (
            <div className="qr-loading">Chargement...</div>
          ) : quizzes.length === 0 ? (
            <div className="qr-empty">
              <p>Vous n'avez pas encore de quiz.</p>
              <a href="#/create" className="qr-link">Créer un quiz</a>
            </div>
          ) : (
            <>
              <select
                className="qr-select-input"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
              >
                <option value="">Sélectionnez un quiz</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>

              <button
                className="qr-btn qr-btn--primary"
                onClick={handleCreateRoom}
                disabled={!selectedQuizId || loading}
              >
                {loading ? 'Création...' : 'Créer la room'}
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // Join room view
  if (viewMode === 'join') {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Rejoindre une partie</h1>
          <p className="arena-page__subtitle">Entrez le code et votre nom</p>
        </header>

        <div className="arena-panel qr-join">
          <button className="qr-back" onClick={() => setViewMode('select')}>← Retour</button>

          {socket.error && (
            <div className="qr-error">{socket.error}</div>
          )}

          <input
            className="qr-input"
            type="text"
            placeholder="Code de la room (ex: ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />

          <input
            className="qr-input"
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <button
            className="qr-btn qr-btn--primary"
            onClick={handleJoinRoom}
            disabled={!joinCode || !playerName || loading}
          >
            {loading ? 'Connexion...' : 'Rejoindre'}
          </button>
        </div>
      </section>
    );
  }

  // Room view
  return (
    <section className="arena-page">
      {/* Lobby */}
      {socket.roomState === 'lobby' && (
        <RoomLobby
          roomCode={socket.roomCode!}
          players={socket.players}
          isOwner={socket.isOwner}
          quizTitle={socket.quizTitle}
          onStart={socket.startQuiz}
        />
      )}

      {/* Playing */}
      {socket.roomState === 'playing' && socket.currentQuestion && (
        <QuestionView
          question={socket.currentQuestion}
          timer={socket.timer}
          isOwner={socket.isOwner}
          selectedAnswer={selectedAnswer}
          hasAnswered={hasAnswered}
          answeredCount={socket.answeredCount}
          totalPlayers={socket.players.length}
          onAnswer={handleAnswer}
        />
      )}

      {/* Reveal */}
      {socket.roomState === 'reveal' && socket.revealData && socket.currentQuestion && (
        <RevealView
          question={socket.currentQuestion}
          revealData={socket.revealData}
          selectedAnswer={selectedAnswer}
          isOwner={socket.isOwner}
          onNext={socket.nextQuestion}
        />
      )}

      {/* Finished */}
      {socket.roomState === 'finished' && socket.finalScores && (
        <FinalView scores={socket.finalScores} />
      )}
    </section>
  );
}

// Sub-components

function RoomLobby({
  roomCode,
  players,
  isOwner,
  quizTitle,
  onStart,
}: {
  roomCode: string;
  players: Player[];
  isOwner: boolean;
  quizTitle: string;
  onStart: () => void;
}) {
  // Generate the join URL for the QR code
  const joinUrl = `${window.location.origin}${window.location.pathname}#/room/${roomCode}`;

  return (
    <>
      <header className="arena-page__heading">
        <h1 className="arena-page__title">
          {isOwner ? 'Votre Room' : 'Salle d\'attente'}
        </h1>
        {quizTitle && <p className="arena-page__subtitle">{quizTitle}</p>}
      </header>

      <div className="arena-panel qr-lobby">
        <div className="qr-code-display">
          <span className="qr-code-label">Code de la room</span>
          <span className="qr-code-value">{roomCode}</span>
        </div>

        {/* QR Code for owner */}
        {isOwner && (
          <div className="qr-qrcode-container">
            <QRCodeSVG 
              value={joinUrl} 
              size={180}
              bgColor="transparent"
              fgColor="#ffffff"
              level="M"
            />
            <span className="qr-qrcode-label">Scannez pour rejoindre</span>
            <span className="qr-qrcode-url">{joinUrl}</span>
          </div>
        )}

        <div className="qr-players">
          <h3 className="qr-players__title">
            Joueurs ({players.length})
          </h3>
          {players.length === 0 ? (
            <p className="qr-players__empty">En attente de joueurs...</p>
          ) : (
            <ul className="qr-players__list">
              {players.map((p) => (
                <li key={p.id} className="qr-players__item">{p.name}</li>
              ))}
            </ul>
          )}
        </div>

        {isOwner && (
          <button
            className="qr-btn qr-btn--start"
            onClick={onStart}
            disabled={players.length === 0}
          >
            🚀 Lancer le quiz
          </button>
        )}

        {!isOwner && (
          <div className="qr-waiting">En attente du lancement...</div>
        )}
      </div>
    </>
  );
}

function QuestionView({
  question,
  timer,
  isOwner,
  selectedAnswer,
  hasAnswered,
  answeredCount,
  totalPlayers,
  onAnswer,
}: {
  question: Question;
  timer: number;
  isOwner: boolean;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  answeredCount: number;
  totalPlayers: number;
  onAnswer: (index: number) => void;
}) {
  return (
    <>
      <header className="arena-page__heading">
        <h1 className="arena-page__title">
          Question {question.index + 1} / {question.total}
        </h1>
      </header>

      <div className="arena-panel qr-question">
        <div className={`qr-timer ${timer <= 5 ? 'qr-timer--warning' : ''}`}>
          <span className="qr-timer__value">{timer}</span>
          <span className="qr-timer__label">secondes</span>
        </div>

        <div className="qr-question__text">{question.question}</div>

        {isOwner ? (
          <div className="qr-owner-view">
            <p className="qr-owner-status">
              Réponses reçues: {answeredCount} / {totalPlayers}
            </p>
            <div className="qr-options qr-options--owner">
              {question.options.map((opt, i) => (
                <div key={i} className="qr-option qr-option--disabled">
                  <span className="qr-option__letter">{String.fromCharCode(65 + i)}</span>
                  <span className="qr-option__text">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="qr-options">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`qr-option ${selectedAnswer === i ? 'qr-option--selected' : ''} ${hasAnswered ? 'qr-option--locked' : ''}`}
                onClick={() => onAnswer(i)}
                disabled={hasAnswered}
              >
                <span className="qr-option__letter">{String.fromCharCode(65 + i)}</span>
                <span className="qr-option__text">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {hasAnswered && !isOwner && (
          <div className="qr-answered">✓ Réponse envoyée</div>
        )}
      </div>
    </>
  );
}

function RevealView({
  question,
  revealData,
  selectedAnswer,
  isOwner,
  onNext,
}: {
  question: Question;
  revealData: TimerEndData;
  selectedAnswer: number | null;
  isOwner: boolean;
  onNext: () => void;
}) {
  const isCorrect = selectedAnswer === revealData.correctAnswer;

  return (
    <>
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Réponse</h1>
      </header>

      <div className="arena-panel qr-reveal">
        <div className="qr-question__text">{question.question}</div>

        <div className="qr-options qr-options--reveal">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`qr-option qr-option--reveal ${i === revealData.correctAnswer ? 'qr-option--correct' : ''} ${selectedAnswer === i && i !== revealData.correctAnswer ? 'qr-option--wrong' : ''}`}
            >
              <span className="qr-option__letter">{String.fromCharCode(65 + i)}</span>
              <span className="qr-option__text">{opt}</span>
              {i === revealData.correctAnswer && <span className="qr-option__check">✓</span>}
            </div>
          ))}
        </div>

        {revealData.explanation && (
          <div className="qr-explanation">
            <strong>Explication:</strong> {revealData.explanation}
          </div>
        )}

        {!isOwner && (
          <div className={`qr-result ${isCorrect ? 'qr-result--correct' : 'qr-result--wrong'}`}>
            {selectedAnswer === null ? '❌ Pas de réponse' : isCorrect ? '✓ Bonne réponse!' : '✗ Mauvaise réponse'}
          </div>
        )}

        <div className="qr-scores">
          <h3>Classement</h3>
          <ol className="qr-scores__list">
            {revealData.scores.slice(0, 5).map((p, i) => (
              <li key={p.id} className="qr-scores__item">
                <span className="qr-scores__rank">{i + 1}</span>
                <span className="qr-scores__name">{p.name}</span>
                <span className="qr-scores__points">{p.score} pts</span>
              </li>
            ))}
          </ol>
        </div>

        {isOwner && (
          <button className="qr-btn qr-btn--primary" onClick={onNext}>
            Question suivante →
          </button>
        )}
      </div>
    </>
  );
}

function FinalView({ scores }: { scores: Player[] }) {
  return (
    <>
      <header className="arena-page__heading">
        <h1 className="arena-page__title">🏆 Quiz Terminé!</h1>
      </header>

      <div className="arena-panel qr-final">
        <div className="qr-podium">
          {scores.slice(0, 3).map((p, i) => (
            <div key={p.id} className={`qr-podium__item qr-podium__item--${i + 1}`}>
              <span className="qr-podium__medal">{['🥇', '🥈', '🥉'][i]}</span>
              <span className="qr-podium__name">{p.name}</span>
              <span className="qr-podium__score">{p.score} pts</span>
            </div>
          ))}
        </div>

        <div className="qr-scores qr-scores--full">
          <h3>Classement complet</h3>
          <ol className="qr-scores__list">
            {scores.map((p, i) => (
              <li key={p.id} className="qr-scores__item">
                <span className="qr-scores__rank">{i + 1}</span>
                <span className="qr-scores__name">{p.name}</span>
                <span className="qr-scores__points">{p.score} pts</span>
              </li>
            ))}
          </ol>
        </div>

        <a href="#/" className="qr-btn qr-btn--primary">
          Retour à l'accueil
        </a>
      </div>
    </>
  );
}
