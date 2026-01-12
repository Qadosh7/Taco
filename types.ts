
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

export interface PlayerAvatar {
  color: string;
  emoji: string;
  id: string;
}

export interface Reaction {
  id: string;
  playerId: string;
  emoji: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isHost: boolean;
  cardsPlayedThisRound: number;
  avatar: PlayerAvatar;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  currentTurnIndex: number;
  tablePile: Card[];
  lastLoserId: string | null;
  winnerId: string | null;
  reactions: Reaction[];
  chat: ChatMessage[];
}
