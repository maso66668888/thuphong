// Web Audio API sound synthesizer for Thu Phong study companion

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a warm, charming bamboo bell chime (ideal for reminders)
 */
export function playBambooChime(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a sequence of harmonious notes (Pentatonic scale: G4, B4, D5, G5)
    const freqs = [392.00, 493.88, 587.33, 783.99, 987.77];
    
    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.12;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Warm sine mixed with slight triangle for woody resonance
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume * 0.4, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.95);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Cheerful fanfare when homework task is completed
 */
export function playSuccessFanfare(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Notes: C5, E5, G5, C6 triumphant
    const notes = [
      { freq: 523.25, time: 0, dur: 0.12 },
      { freq: 659.25, time: 0.1, dur: 0.12 },
      { freq: 783.99, time: 0.2, dur: 0.15 },
      { freq: 1046.50, time: 0.32, dur: 0.45 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      
      gain.gain.setValueAtTime(0.01, now + time);
      gain.gain.exponentialRampToValueAtTime(volume * 0.45, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Cute sound effect when panda eats bamboo snack
 */
export function playPandaNom(volume = 0.4) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.16);
    
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.warn('Audio error:', err);
  }
}

// Ambient Sound Manager
let ambientNode: { stop: () => void } | null = null;

export function stopAmbientSound() {
  if (ambientNode) {
    ambientNode.stop();
    ambientNode = null;
  }
}

export function startAmbientSound(type: 'none' | 'bamboo' | 'rain' | 'clock', volume = 0.2) {
  stopAmbientSound();
  if (type === 'none') return;
  
  try {
    const ctx = getAudioContext();
    
    if (type === 'clock') {
      // Periodic clock tick
      let intervalId: number;
      const playTick = () => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      };
      
      intervalId = window.setInterval(playTick, 1000);
      ambientNode = {
        stop: () => clearInterval(intervalId),
      };
    } else if (type === 'rain' || type === 'bamboo') {
      // Noise buffer for rain / gentle bamboo wind
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      
      // Pink / Brown noise for gentle natural rain or wind
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to soften the sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'rain' ? 800 : 450;

      const gain = ctx.createGain();
      gain.gain.value = volume * 0.25;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      ambientNode = {
        stop: () => {
          try {
            whiteNoise.stop();
            whiteNoise.disconnect();
          } catch {
            // ignore
          }
        },
      };
    }
  } catch (err) {
    console.warn('Ambient sound error:', err);
  }
}
