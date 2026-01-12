
import React from 'react';
import { Card, CardType } from '../types';
import { COLORS } from '../constants';

interface CardUIProps {
  card?: Card;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const getIcon = (type: CardType) => {
  switch (type) {
    case CardType.TACO: return '🌮';
    case CardType.GATO: return '🐱';
    case CardType.CABRA: return '🐐';
    case CardType.QUEIJO: return '🧀';
    case CardType.PIZZA: return '🍕';
    case CardType.GORILA: return '🦍';
    case CardType.NARVAL: return '🐳';
    case CardType.MARMOTA: return '🐹';
    default: return '❓';
  }
};

const CardUI: React.FC<CardUIProps> = ({ card, faceDown, onClick, className = '', style }) => {
  if (faceDown) {
    return (
      <div
        onClick={onClick}
        className={`w-24 h-36 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${className}`}
        style={{ ...style, backgroundColor: COLORS.NAVY }}
      >
        <div className="w-16 h-24 border-2 border-white/20 rounded-xl flex flex-col items-center justify-center">
          <span className="text-white font-black text-xs tracking-tighter mb-1 opacity-40 uppercase">Taco</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
             <i className="fa-solid fa-bolt text-white/20 text-sm"></i>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`w-24 h-36 rounded-2xl bg-white border-2 border-[#0D3B66]/10 shadow-xl flex flex-col items-center justify-between p-3 relative select-none overflow-hidden ${className} ${card.isSpecial ? 'ring-4 ring-[#F4D35E]' : ''}`}
    >
      <div className="w-full flex justify-between items-center">
        <span className="text-[10px] font-black text-[#0D3B66] uppercase tracking-tighter">{card.name}</span>
        {card.isSpecial && <i className="fa-solid fa-star text-[#F4D35E] text-[8px]"></i>}
      </div>
      
      <div className="text-4xl drop-shadow-sm">{getIcon(card.type)}</div>
      
      <div className="w-full text-center">
         <div className={`h-1.5 w-full rounded-full ${card.isSpecial ? 'bg-[#F4D35E]' : 'bg-[#0D3B66]/5'}`}></div>
         <span className="text-[8px] font-bold text-[#0D3B66]/40 uppercase mt-1 block">Taco Online</span>
      </div>

      {/* Marca d'água de fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
         <span className="text-8xl transform -rotate-12">{getIcon(card.type)}</span>
      </div>
    </div>
  );
};

export default CardUI;
