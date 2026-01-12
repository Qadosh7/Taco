
import React from 'react';
import { PlayerAvatar } from '../types';

interface AvatarCharacterProps {
  avatar: PlayerAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isFloating?: boolean;
}

const AvatarCharacter: React.FC<AvatarCharacterProps> = ({ avatar, size = 'md', className = '', isFloating = false }) => {
  const sizeMap = {
    sm: 'w-8 h-12',
    md: 'w-12 h-18',
    lg: 'w-16 h-24',
    xl: 'w-24 h-32'
  };

  const eyeSize = {
    sm: 'w-0.5 h-0.5',
    md: 'w-1 h-1',
    lg: 'w-1.5 h-1.5',
    xl: 'w-2 h-2'
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className} ${isFloating ? 'animate-bounce-subtle' : ''}`}>
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      
      {/* Corpo do Personagem (Bean Shape) */}
      <div 
        className="w-full h-full rounded-full relative overflow-hidden border-[3px] border-black/10 shadow-lg"
        style={{ 
          backgroundColor: avatar.color,
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)`
        }}
      >
        {/* Detalhe do Capacete (Topo Sombreado) */}
        <div className="absolute top-0 left-0 w-full h-[45%] bg-black/10 border-b-[2px] border-white/20"></div>
        
        {/* Faceplate (Viseira onde ficam os olhos) */}
        <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[65%] h-[32%] bg-white rounded-full flex items-center justify-center gap-[15%] shadow-inner border border-black/5 z-20">
          <div className={`${eyeSize[size]} bg-gray-900 rounded-full`}></div>
          <div className={`${eyeSize[size]} bg-gray-900 rounded-full`}></div>
        </div>

        {/* Aba do Capacete (Rim) */}
        <div className="absolute top-[24%] left-1/2 -translate-x-1/2 w-[75%] h-[6%] bg-black/20 rounded-full z-10"></div>

        {/* Reflexos de luz no "plástico" do capacete */}
        <div className="absolute top-[6%] left-[25%] w-[15%] h-[8%] bg-white/40 rounded-full rotate-45 blur-[0.5px]"></div>
        
        {/* Brilho de profundidade geral */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
      </div>

      {/* Acessório/Ícone (No topo do capacete) */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 drop-shadow-md z-30 transition-transform hover:scale-125
        ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base'}
      `}>
        {avatar.emoji}
      </div>

      {/* Sombra no chão */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-2 bg-black/10 rounded-full blur-[2px]"></div>
    </div>
  );
};

export default AvatarCharacter;
