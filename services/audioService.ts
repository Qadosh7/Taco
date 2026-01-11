
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const AudioService = {
  playCard: () => playTone(400, 'sine', 0.1, 0.2),
  playDeal: () => {
    for(let i=0; i<3; i++) {
      setTimeout(() => playTone(600 + (i*100), 'sine', 0.05, 0.1), i * 50);
    }
  },
  playSlap: () => playTone(150, 'triangle', 0.3, 0.5),
  playError: () => {
    playTone(100, 'sawtooth', 0.4, 0.2);
    playTone(110, 'sawtooth', 0.4, 0.2);
  },
  playSuccess: () => {
    playTone(523.25, 'sine', 0.1, 0.2);
    setTimeout(() => playTone(659.25, 'sine', 0.1, 0.2), 100);
  }
};
