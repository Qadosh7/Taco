
import { Card, Suit, Player } from '../types';
import { CARD_VALUES } from '../constants.tsx';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

  suits.forEach(suit => {
    CARD_VALUES.forEach(value => {
      deck.push({
        id: `${value}-${suit}-${Math.random().toString(36).substr(2, 9)}`,
        suit,
        value,
        color: (suit === Suit.HEARTS || suit === Suit.DIAMONDS) ? 'red' : 'black'
      });
    });
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

  const newPlayers = players.map(p => ({ ...p, hand: [] }));
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
