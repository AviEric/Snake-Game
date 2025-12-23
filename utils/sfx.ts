let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number, fadeOut = true) => {
  if (!audioCtx) return;
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
  }

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const sfx = {
  move: () => {
    initAudio();
    // Very subtle, high-pitched mechanical click
    playTone(1800, 'square', 0.02, 0.003);
  },
  eat: () => {
    initAudio();
    // A bouncy "cartoon" pop
    playTone(400, 'sine', 0.15, 0.08);
    setTimeout(() => playTone(800, 'sine', 0.1, 0.04), 40);
  },
  error: () => {
    initAudio();
    if (!audioCtx) return;
    
    // Low-frequency glitch/crash
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.4);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
  },
  start: () => {
    initAudio();
    // Power-up sequence
    playTone(200, 'sawtooth', 0.1, 0.02);
    setTimeout(() => playTone(400, 'sawtooth', 0.1, 0.02), 100);
    setTimeout(() => playTone(800, 'sawtooth', 0.2, 0.01), 200);
  },
  ui: () => {
    initAudio();
    // Short metallic tap for buttons
    playTone(1200, 'triangle', 0.05, 0.01);
  }
};