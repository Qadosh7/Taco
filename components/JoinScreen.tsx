
import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';

interface JoinScreenProps {
  initialCode?: string;
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ initialCode, onCreate, onJoin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState(initialCode || '');
  const [view, setView] = useState<'HOME' | 'CREATE' | 'JOIN'>(initialCode ? 'JOIN' : 'HOME');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setView('JOIN');
    }
  }, [initialCode]);

  const containerStyle = "min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF0CA]";

  if (view === 'CREATE') {
    return (
      <div className={containerStyle}>
        <h1 className="text-3xl font-bold mb-8 text-[#0D3B66]">Nova Partida</h1>
        <input
          type="text"
          placeholder="Seu Nome"
          className="w-full max-w-xs p-4 rounded-xl border-2 border-[#0D3B66] mb-4 text-center text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => name && onCreate(name)}
          className="w-full max-w-xs p-4 bg-[#F95738] text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          GERAR SALA
        </button>
        <button onClick={() => setView('HOME')} className="mt-4 text-[#0D3B66] font-semibold">Voltar</button>
      </div>
    );
  }

  if (view === 'JOIN') {
    return (
      <div className={containerStyle}>
        <h1 className="text-3xl font-bold mb-8 text-[#0D3B66]">Entrar na Sala</h1>
        <input
          type="text"
          placeholder="Código da Sala"
          className="w-full max-w-xs p-4 rounded-xl border-2 border-[#0D3B66] mb-4 text-center text-lg uppercase bg-white"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <input
          type="text"
          placeholder="Seu Apelido"
          className="w-full max-w-xs p-4 rounded-xl border-2 border-[#0D3B66] mb-4 text-center text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => name && code && onJoin(code, name)}
          className="w-full max-w-xs p-4 bg-[#F4D35E] text-[#0D3B66] rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          ENTRAR AGORA
        </button>
        <button onClick={() => setView('HOME')} className="mt-4 text-[#0D3B66] font-semibold">Voltar</button>
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      <div className="text-6xl mb-4 text-[#0D3B66]">🃏</div>
      <h1 className="text-5xl font-black mb-2 text-[#0D3B66]">TACO</h1>
      <p className="text-[#EE964B] font-bold mb-12 tracking-widest uppercase text-sm">Online Edition</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => setView('CREATE')}
          className="p-5 bg-[#0D3B66] text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-between px-8 transition-all hover:translate-y-[-2px]"
        >
          CRIAR SALA <i className="fa-solid fa-plus"></i>
        </button>
        <button
          onClick={() => setView('JOIN')}
          className="p-5 bg-[#F95738] text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-between px-8 transition-all hover:translate-y-[-2px]"
        >
          ENTRAR <i className="fa-solid fa-right-to-bracket"></i>
        </button>
      </div>

      <p className="mt-16 text-xs text-[#0D3B66]/60">Criado por Desenvolvedores Full Stack</p>
    </div>
  );
};

export default JoinScreen;
