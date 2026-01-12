
import React from 'react';
import { Card, CardType } from '../types';
import { COLORS } from '../constants';

interface CardUIProps {
  card?: Card;
  faceDown?: boolean;
  highlightIndex?: number; // 0: Taco, 1: Gato, 2: Cabra, 3: Queijo, 4: Pizza
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const SEQUENCE = ['Taco', 'Gato', 'Cabra', 'Queijo', 'Pizza'];

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

const CardUI: React.FC<CardUIProps> = ({ card, faceDown, highlightIndex = 0, onClick, className = '', style }) => {
  // Tamanho aumentado: w-44 h-64 (aprox 176px x 256px) para maior destaque
  const baseClasses = "w-44 h-64 rounded-[3rem] border-[8px] shadow-2xl flex flex-col items-center select-none overflow-hidden transition-all duration-300";

  if (faceDown) {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} bg-white border-[#F0F2F5] justify-center p-6 cursor-pointer active:scale-95 ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-2.5 w-full">
          {SEQUENCE.map((word, idx) => (
            <div 
              key={word}
              className={`text-[14px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                idx === highlightIndex 
                ? 'text-[#0D3B66] scale-125 translate-x-1' 
                : 'text-gray-100 scale-90'
              }`}
            >
              {word} {idx === highlightIndex && '✨'}
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i === highlightIndex % 3 ? 'bg-[#F4D35E]' : 'bg-gray-100'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`${baseClasses} bg-white border-white p-6 relative ${className} ${card.isSpecial ? 'ring-[12px] ring-[#F4D35E]/40' : ''}`}
    >
      <div className="w-full flex justify-center items-center z-10 mb-2">
        <span className="text-[13px] font-black text-[#0D3B66] uppercase tracking-tighter bg-[#0D3B66]/5 px-5 py-2 rounded-full border border-[#0D3B66]/10">
          {card.name}
        </span>
      </div>
      
      <div className="flex-1 flex items-center justify-center z-10">
        <div className="text-8xl drop-shadow-lg transform scale-110 transition-transform hover:rotate-6">
          {getIcon(card.type)}
        </div>
      </div>
      
      <div className="w-full text-center flex justify-center gap-2.5 z-10 mt-3">
         {[...Array(3)].map((_, i) => (
           <div key={i} className={`h-2.5 w-2.5 rounded-full ${card.isSpecial ? 'bg-[#F4D35E]' : 'bg-[#0D3B66]/10'}`}></div>
         ))}
      </div>

      {/* Marca d'água de fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
         <span className="text-[14rem] transform -rotate-12">{getIcon(card.type)}</span>
      </div>
      
      {/* Brilho no topo */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default CardUI;
