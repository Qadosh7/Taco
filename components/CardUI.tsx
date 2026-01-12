
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
        className={`w-24 h-36 rounded-[2rem] border-[6px] border-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${className}`}
        style={{ ...style, backgroundColor: COLORS.NAVY }}
      >
        <div className="w-16 h-24 border-4 border-white/20 rounded-[1.5rem] flex flex-col items-center justify-center">
          <div className="text-3xl opacity-30">✨</div>
          <span className="text-white font-black text-[10px] tracking-widest mt-2 opacity-30 uppercase">TACO</span>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`w-24 h-36 rounded-[2rem] bg-white border-[6px] border-[#0D3B66]/5 shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-between p-4 relative select-none overflow-hidden ${className} ${card.isSpecial ? 'ring-8 ring-[#F4D35E]/50' : ''}`}
    >
      <div className="w-full flex justify-center items-center">
        <span className="text-[10px] font-black text-[#0D3B66] uppercase tracking-tighter bg-[#0D3B66]/5 px-2 py-0.5 rounded-full">{card.name}</span>
      </div>
      
      <div className="text-5xl drop-shadow-md transform scale-110">{getIcon(card.type)}</div>
      
      <div className="w-full text-center flex justify-center gap-1">
         {[...Array(3)].map((_, i) => (
           <div key={i} className={`h-2 w-2 rounded-full ${card.isSpecial ? 'bg-[#F4D35E]' : 'bg-[#0D3B66]/10'}`}></div>
         ))}
      </div>

      {/* Marca d'água de fundo infantil */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
         <span className="text-9xl transform -rotate-12">{getIcon(card.type)}</span>
      </div>
    </div>
  );
};

export default CardUI;
