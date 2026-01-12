
export enum CardType {
  TACO = 'Taco',
  GATO = 'Gato',
  CABRA = 'Cabra',
  QUEIJO = 'Queijo',
  PIZZA = 'Pizza',
  GORILA = 'Gorila',
  NARVAL = 'Narval',
  MARMOTA = 'Marmota'
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  ROUND_END = 'ROUND_END',
  GAME_OVER = 'GAME_OVER'
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  isSpecial: boolean;
  image_front_url: string;
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
