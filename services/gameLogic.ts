
import { Card, CardType, Player } from '../types';

const TACO_DECK_CONFIG = [
  { type: CardType.TACO, quantity: 11, isSpecial: false },
  { type: CardType.GATO, quantity: 11, isSpecial: false },
  { type: CardType.CABRA, quantity: 11, isSpecial: false },
  { type: CardType.QUEIJO, quantity: 11, isSpecial: false },
  { type: CardType.PIZZA, quantity: 11, isSpecial: false },
  { type: CardType.GORILA, quantity: 3, isSpecial: true },
  { type: CardType.NARVAL, quantity: 3, isSpecial: true },
  { type: CardType.MARMOTA, quantity: 3, isSpecial: true },
];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];

  TACO_DECK_CONFIG.forEach(config => {
    for (let i = 0; i < config.quantity; i++) {
      const name = config.type.toLowerCase();
      deck.push({
        id: `${config.type}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.type,
        type: config.type,
        isSpecial: config.isSpecial,
        image_front_url: `/storage/v1/object/public/cards/${name}_front.png`
      });
    }
  });

  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const distributeCards = (players: Player[], deck: Card[]): Player[] => {
  const playerCount = players.length;
  if (playerCount === 0) return players;

  const newPlayers: Player[] = players.map(p => ({ ...p, hand: [] }));
  const shuffled = shuffleDeck(deck);

  shuffled.forEach((card, index) => {
    const playerIndex = index % playerCount;
    newPlayers[playerIndex].hand.push(card);
  });

  return newPlayers;
};

export const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};
