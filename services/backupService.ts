
export const getProjectSource = () => {
  // Esta função simula a leitura dos arquivos do projeto para criar um snapshot
  // Em um ambiente real, isso poderia ser gerado dinamicamente.
  return {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    files: [
      { path: "index.html", description: "Estrutura base e estilos globais" },
      { path: "index.tsx", description: "Ponto de entrada React" },
      { path: "App.tsx", description: "Lógica principal de estado e sincronização" },
      { path: "types.ts", description: "Definições de tipos e interfaces" },
      { path: "constants.tsx", description: "Constantes de cores e valores" },
      { path: "components/JoinScreen.tsx", description: "Tela de entrada e seleção" },
      { path: "components/Lobby.tsx", description: "Sala de espera e QR Code" },
      { path: "components/GameBoard.tsx", description: "Arena de jogo principal" },
      { path: "components/CardUI.tsx", description: "Componente visual das cartas" },
      { path: "components/AvatarCharacter.tsx", description: "Personagens estilo Fall Guys" },
      { path: "components/ReactionSystem.tsx", description: "Sistema de chat e emojis" },
      { path: "components/RulesModal.tsx", description: "Manual de regras" },
      { path: "services/gameLogic.ts", description: "Lógica de baralho e distribuição" },
      { path: "services/supabase.ts", description: "Configuração do banco de dados" },
      { path: "services/audioService.ts", description: "Efeitos sonoros sintetizados" },
      { path: "services/hapticService.ts", description: "Feedback tátil (vibração)" }
    ]
  };
};

export const downloadBackup = (projectState: any) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectState, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `taco_online_backup_${new Date().getTime()}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
