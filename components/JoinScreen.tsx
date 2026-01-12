
import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import RulesModal from './RulesModal';

interface JoinScreenProps {
  initialCode?: string;
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ initialCode, onCreate, onJoin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState(initialCode || '');
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
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-[#0D3B66] w-full max-w-xs relative">
            <input
              type="text"
              placeholder="Como te chamam?"
              className="w-full p-5 rounded-2xl border-4 border-[#EE964B] mb-6 text-center text-xl font-bold placeholder:text-gray-300 outline-none focus:border-[#F95738] transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={() => name && onCreate(name)}
              className="w-full p-5 bg-[#F95738] text-white rounded-[2rem] font-black text-xl shadow-[0_8px_0_#A03E2A] active:shadow-none active:translate-y-2 transition-all"
            >
              CRIAR SALA ✨
            </button>
        </div>
        <button onClick={() => setView('HOME')} className="mt-8 text-[#0D3B66] font-black uppercase text-sm tracking-widest border-b-2 border-[#0D3B66]">Voltar</button>
      </div>
    );
  }

  if (view === 'JOIN') {
    return (
      <div className={containerStyle}>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#EE964B]/20 rounded-full blur-3xl"></div>
        <h1 className="text-4xl font-black mb-8 text-[#0D3B66] italic">Entrar no Jogo</h1>
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-[#0D3B66] w-full max-w-xs">
            <input
              type="text"
              placeholder="Código Mágico"
              className="w-full p-5 rounded-2xl border-4 border-[#0D3B66]/10 mb-4 text-center text-2xl font-black uppercase bg-gray-50 outline-none focus:border-[#F4D35E] transition-colors"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <input
              type="text"
              placeholder="Seu Nome"
              className="w-full p-5 rounded-2xl border-4 border-[#EE964B] mb-6 text-center text-xl font-bold outline-none focus:border-[#F95738]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={() => name && code && onJoin(code, name)}
              className="w-full p-5 bg-[#F4D35E] text-[#0D3B66] rounded-[2rem] font-black text-xl shadow-[0_8px_0_#C5A83D] active:shadow-none active:translate-y-2 transition-all"
            >
              ENTRAR AGORA! 🚀
            </button>
        </div>
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
