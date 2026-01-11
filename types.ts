
export enum Suit {
  HEARTS = '♥️',
  DIAMONDS = '♦️',
  CLUBS = '♣️',
  SPADES = '♠️'
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  ROUND_END = 'ROUND_END',
  GAME_OVER = 'GAME_OVER'
}

export interface Card {
  id: string;
  suit: Suit;
  value: string;
  color: 'red' | 'black';
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isHost: boolean;
  cardsPlayedThisRound: number;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  currentTurnIndex: number;
  tablePile: Card[];
  lastLoserId: string | null;
  winnerId: string | null;
}
