
import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import RulesModal from './RulesModal';
import { PlayerAvatar } from '../types';
import AvatarCharacter from './AvatarCharacter';

interface JoinScreenProps {
  initialCode?: string;
  onCreate: (name: string, avatar: PlayerAvatar) => void;
  onJoin: (code: string, name: string, avatar: PlayerAvatar) => void;
}

const AVATARS: PlayerAvatar[] = [
  { id: '1', color: '#FF69B4', emoji: '🎀' }, // Rosa Lacinho
  { id: '2', color: '#4CC9F0', emoji: '🎧' }, // Azul DJ
  { id: '3', color: '#F4D35E', emoji: '🐥' }, // Amarelo Pintinho
  { id: '4', color: '#72EFDD', emoji: '🦖' }, // Ciano Dino
  { id: '5', color: '#B79CED', emoji: '🦄' }, // Roxo Unicórnio
  { id: '6', color: '#F95738', emoji: '🦊' }, // Laranja Raposa
  { id: '7', color: '#E5E5E5', emoji: '👻' }, // Fantasma
  { id: '8', color: '#52B788', emoji: '🐸' }, // Sapo
  { id: '9', color: '#FFD700', emoji: '👑' }, // Rei Ouro
  { id: '10', color: '#8B4513', emoji: '🌮' }, // O próprio Taco
];

// Componente extraído para fora para manter a estabilidade do DOM e o foco do input
interface FormContentProps {
  actionLabel: string;
  onAction: () => void;
  name: string;
  setName: (val: string) => void;
  selectedAvatar: PlayerAvatar;
  setSelectedAvatar: (av: PlayerAvatar) => void;
}

const FormContent: React.FC<FormContentProps> = ({ actionLabel, onAction, name, setName, selectedAvatar, setSelectedAvatar }) => (
  <div className="bg-white p-6 rounded-[3rem] shadow-2xl border-4 border-[#0D3B66] w-full max-w-sm relative animate-in zoom-in duration-300">
    <div className="mb-6">
      <label className="text-[10px] font-black text-[#0D3B66]/40 uppercase tracking-widest block mb-4 text-center">Quem é você no jogo?</label>
      
      {/* Preview Grande - h-28 agora é suficiente para o avatar reduzido */}
      <div className="flex justify-center mb-6 h-28 items-end">
        <AvatarCharacter avatar={selectedAvatar} size="xl" isFloating={true} />
      </div>

      <div className="grid grid-cols-5 gap-2 mb-2 p-2 bg-gray-50 rounded-3xl border-2 border-gray-100 overflow-y-auto max-h-40 no-scrollbar">
        {AVATARS.map(av => (
          <button 
            key={av.id}
            onClick={() => setSelectedAvatar(av)}
            className={`p-1 rounded-2xl transition-all flex justify-center items-center ${selectedAvatar.id === av.id ? 'bg-[#F4D35E] scale-110 shadow-md ring-2 ring-[#0D3B66]' : 'hover:bg-white'}`}
          >
            <AvatarCharacter avatar={av} size="sm" />
          </button>
        ))}
      </div>
    </div>

    <input
      type="text"
      placeholder="Seu nome..."
      className="w-full p-4 rounded-2xl border-4 border-[#EE964B] mb-6 text-center text-xl font-bold placeholder:text-gray-300 outline-none focus:border-[#F95738] transition-colors"
      value={name}
      onChange={(e) => setName(e.target.value)}
      autoFocus
    />

    <button
      onClick={onAction}
      className="w-full p-5 bg-[#F95738] text-white rounded-[2rem] font-black text-xl shadow-[0_8px_0_#A03E2A] active:shadow-none active:translate-y-2 transition-all"
    >
      {actionLabel} ✨
    </button>
  </div>
);

const JoinScreen: React.FC<JoinScreenProps> = ({ initialCode, onCreate, onJoin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState(initialCode || '');
  const [selectedAvatar, setSelectedAvatar] = useState<PlayerAvatar>(AVATARS[0]);
  const [view, setView] = useState<'HOME' | 'CREATE' | 'JOIN'>(initialCode ? 'JOIN' : 'HOME');
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setView('JOIN');
    }
  }, [initialCode]);

  const containerStyle = "min-h-screen flex flex-col items-center justify-center p-6 bg-transparent relative overflow-hidden";

  if (view === 'CREATE') {
    return (
      <div className={containerStyle}>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#F4D35E]/30 rounded-full blur-3xl"></div>
        <h1 className="text-4xl font-black mb-8 text-[#0D3B66] italic underline decoration-[#F95738] decoration-4">Nova Partida!</h1>
        <FormContent 
          actionLabel="CRIAR SALA" 
          onAction={() => name && onCreate(name, selectedAvatar)}
          name={name}
          setName={setName}
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
        />
        <button onClick={() => setView('HOME')} className="mt-8 text-[#0D3B66] font-black uppercase text-sm tracking-widest border-b-2 border-[#0D3B66]">Voltar</button>
      </div>
    );
  }

  if (view === 'JOIN') {
    return (
      <div className={containerStyle}>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#EE964B]/20 rounded-full blur-3xl"></div>
        <h1 className="text-4xl font-black mb-6 text-[#0D3B66] italic">Entrar no Jogo</h1>
        
        <div className="bg-white p-6 rounded-[3rem] shadow-2xl border-4 border-[#0D3B66] w-full max-w-sm mb-4">
           <input
            type="text"
            placeholder="CÓDIGO"
            className="w-full p-4 rounded-2xl border-4 border-[#0D3B66]/10 mb-0 text-center text-2xl font-black uppercase bg-gray-50 outline-none focus:border-[#F4D35E] transition-colors"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>

        <FormContent 
          actionLabel="ENTRAR AGORA!" 
          onAction={() => name && code && onJoin(code, name, selectedAvatar)}
          name={name}
          setName={setName}
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
        />
        <button onClick={() => setView('HOME')} className="mt-8 text-[#0D3B66] font-black uppercase text-sm tracking-widest border-b-2 border-[#0D3B66]">Voltar</button>
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-white/50 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="text-8xl relative animate-bounce" style={{ animationDuration: '3s' }}>🌮</div>
      </div>
      
      <div className="text-center relative">
          <h1 className="text-7xl font-black mb-0 text-[#0D3B66] tracking-tighter drop-shadow-[0_4px_0_#FFF]">TACO</h1>
          <p className="text-[#F95738] font-black mb-12 tracking-[0.3em] uppercase text-xs bg-white px-3 py-1 rounded-full shadow-sm">Online Edition</p>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-xs relative">
        <button
          onClick={() => setView('CREATE')}
          className="p-6 bg-[#0D3B66] text-white rounded-[2.5rem] font-black text-xl shadow-[0_10px_0_#06213D] flex items-center justify-between px-10 active:shadow-none active:translate-y-2 transition-all"
        >
          CRIAR SALA <i className="fa-solid fa-wand-magic-sparkles text-[#F4D35E]"></i>
        </button>
        
        <button
          onClick={() => setView('JOIN')}
          className="p-6 bg-[#F95738] text-white rounded-[2.5rem] font-black text-xl shadow-[0_10px_0_#A03E2A] flex items-center justify-between px-10 active:shadow-none active:translate-y-2 transition-all"
        >
          ENTRAR <i className="fa-solid fa-gamepad text-white/50"></i>
        </button>
        
        <button
          onClick={() => setShowRules(true)}
          className="mt-4 p-5 border-4 border-dashed border-[#0D3B66]/20 text-[#0D3B66] rounded-[2rem] font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 active:bg-white/40 transition-colors"
        >
          <i className="fa-solid fa-book-open"></i> Regras de Ouro
        </button>
      </div>

      <div className="mt-16 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#0D3B66]/5 shadow-sm">
          <p className="text-[10px] font-black text-[#0D3B66]/40 uppercase tracking-[0.2em]">Feito com carinho ❤️</p>
      </div>
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default JoinScreen;
