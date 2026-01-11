
import React from 'react';
import { Card } from '../types';
import { COLORS } from '../constants';

interface CardUIProps {
  card?: Card;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const CardUI: React.FC<CardUIProps> = ({ card, faceDown, onClick, className = '', style }) => {
  if (faceDown) {
    return (
      <div
        onClick={onClick}
        className={`w-24 h-36 rounded-xl border-4 border-white shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${className}`}
        style={{ ...style, backgroundColor: COLORS.NAVY }}
      >
        <div className="w-16 h-24 border-2 border-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white/30 text-4xl font-bold">T</span>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`w-24 h-36 rounded-xl bg-white border border-gray-200 shadow-md flex flex-col p-2 relative select-none ${className}`}
    >
      <div className={`text-lg font-bold ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
        {card.value}
      </div>
      <div className={`text-xl ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
        {card.suit}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <span className="text-6xl">{card.suit}</span>
      </div>
      <div className={`absolute bottom-2 right-2 text-lg font-bold rotate-180 ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
        {card.value}
      </div>
    </div>
  );
};

export default CardUI;
