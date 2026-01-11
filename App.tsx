
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, Player, Card } from './types';
import { createDeck, distributeCards, generateRoomCode } from './services/gameLogic';
import { COLORS } from './constants.tsx';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import JoinScreen from './components/JoinScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');

  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setUrlRoomCode(room.toUpperCase());
    }
  }, []);

  // Persistence simulation (localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('taco_session');
    if (saved) {
      const { state, userId } = JSON.parse(saved);
      // Optional: Check if the room from URL is different from saved session
      setGameState(state);
      setCurrentUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (gameState && currentUserId) {
      localStorage.setItem('taco_session', JSON.stringify({ state: gameState, userId: currentUserId }));
    }
  }, [gameState, currentUserId]);

  const handleCreateRoom = useCallback((adminName: string) => {
    const adminId = Math.random().toString(36).substr(2, 9);
    const newAdmin: Player = {
      id: adminId,
      name: adminName,
      hand: [],
      isHost: true,
      cardsPlayedThisRound: 0
    };

    setGameState({
      roomCode: generateRoomCode(),
      phase: GamePhase.LOBBY,
      players: [newAdmin],
      currentTurnIndex: 0,
      tablePile: [],
      lastLoserId: null,
      winnerId: null
    });
    setCurrentUserId(adminId);
  }, []);

  const handleJoinRoom = useCallback((code: string, playerName: string) => {
    // In a real app, we'd fetch the room. Here we simulate joining.
    if (gameState && gameState.roomCode === code) {
      const playerId = Math.random().toString(36).substr(2, 9);
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        hand: [],
        isHost: false,
        cardsPlayedThisRound: 0
      };

      setGameState(prev => prev ? ({
        ...prev,
        players: [...prev.players, newPlayer]
      }) : null);
      setCurrentUserId(playerId);
    } else {
      alert("Sala não encontrada ou código inválido.");
    }
  }, [gameState]);

  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    const deck = createDeck();
    const playersWithCards = distributeCards(gameState.players, deck);

    setGameState(prev => prev ? ({
      ...prev,
      phase: GamePhase.PLAYING,
      players: playersWithCards,
      currentTurnIndex: 0,
      tablePile: []
    }) : null);
  }, [gameState]);

  const handlePlayCard = useCallback(() => {
    if (!gameState || !currentUserId) return;
    const player = gameState.players[gameState.currentTurnIndex];
    if (player.id !== currentUserId) return;
    if (player.hand.length === 0) {
        setGameState(prev => prev ? ({
          ...prev,
          currentTurnIndex: (prev.currentTurnIndex + 1) % prev.players.length
        }) : null);
        return;
    }

    const newHand = [...player.hand];
    const playedCard = newHand.pop()!;

    setGameState(prev => {
      if (!prev) return null;
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx === prev.currentTurnIndex) {
          return { ...p, hand: newHand, cardsPlayedThisRound: p.cardsPlayedThisRound + 1 };
        }
        return p;
      });

      return {
        ...prev,
        players: updatedPlayers,
        tablePile: [...prev.tablePile, playedCard],
        currentTurnIndex: (prev.currentTurnIndex + 1) % prev.players.length
      };
    });
  }, [gameState, currentUserId]);

  const handleResolveRound = useCallback((loserId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const loser = prev.players.find(p => p.id === loserId);
      if (!loser) return prev;

      const updatedPlayers = prev.players.map(p => {
        if (p.id === loserId) {
          return { ...p, hand: [...p.hand, ...prev.tablePile] };
        }
        return p;
      });

      const totalCards = 52;
      const gameLoser = updatedPlayers.find(p => p.hand.length === totalCards);

      if (gameLoser) {
          return {
              ...prev,
              players: updatedPlayers,
              phase: GamePhase.GAME_OVER,
              tablePile: [],
              lastLoserId: loserId,
              winnerId: gameLoser.id
          };
      }

      return {
        ...prev,
        players: updatedPlayers,
        tablePile: [],
        currentTurnIndex: prev.players.findIndex(p => p.id === loserId),
        phase: GamePhase.PLAYING
      };
    });
  }, []);

  const resetSession = () => {
      localStorage.removeItem('taco_session');
      setGameState(null);
      setCurrentUserId(null);
      // Clear URL room param
      window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (!gameState) {
    return <JoinScreen initialCode={urlRoomCode} onCreate={handleCreateRoom} onJoin={handleJoinRoom} />;
  }

  if (gameState.phase === GamePhase.LOBBY) {
    return (
      <Lobby
        gameState={gameState}
        currentUserId={currentUserId!}
        onStart={handleStartGame}
        onQuit={resetSession}
      />
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      currentUserId={currentUserId!}
      onPlay={handlePlayCard}
      onResolve={handleResolveRound}
      onQuit={resetSession}
    />
  );
};

export default App;
