
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
  // Verso da carta com a sequência dinâmica
  if (faceDown) {
    return (
      <div
        onClick={onClick}
        className={`w-28 h-40 rounded-[2.5rem] bg-white border-[6px] border-[#F0F2F5] shadow-[0_12px_24px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-4 cursor-pointer transition-transform active:scale-90 select-none ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-1.5 w-full">
          {SEQUENCE.map((word, idx) => (
            <div 
              key={word}
              className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                idx === highlightIndex 
                ? 'text-[#0D3B66] scale-125 translate-x-1' 
                : 'text-gray-200 scale-90'
              }`}
            >
              {word} {idx === highlightIndex && '✨'}
            </div>
          ))}
        </div>
        
        {/* Indicador visual de verso */}
        <div className="mt-4 flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === highlightIndex % 3 ? 'bg-[#F4D35E]' : 'bg-gray-100'}`}></div>
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
      className={`w-28 h-40 rounded-[2.5rem] bg-white border-[6px] border-white shadow-[0_15px_30px_rgba(0,0,0,0.12)] flex flex-col items-center justify-between p-4 relative select-none overflow-hidden transition-all ${className} ${card.isSpecial ? 'ring-8 ring-[#F4D35E]/30' : ''}`}
    >
      <div className="w-full flex justify-center items-center z-10">
        <span className="text-[10px] font-black text-[#0D3B66] uppercase tracking-tighter bg-[#0D3B66]/5 px-3 py-1 rounded-full border border-[#0D3B66]/10">
          {card.name}
        </span>
      </div>
      
      <div className="text-6xl drop-shadow-sm transform scale-110 z-10 transition-transform hover:scale-125">
        {getIcon(card.type)}
      </div>
      
      <div className="w-full text-center flex justify-center gap-1.5 z-10 mb-1">
         {[...Array(3)].map((_, i) => (
           <div key={i} className={`h-1.5 w-1.5 rounded-full ${card.isSpecial ? 'bg-[#F4D35E]' : 'bg-[#0D3B66]/10'}`}></div>
         ))}
      </div>

      {/* Marca d'água de fundo suave */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
         <span className="text-[10rem] transform -rotate-12">{getIcon(card.type)}</span>
      </div>
      
      {/* Brilho sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default CardUI;
