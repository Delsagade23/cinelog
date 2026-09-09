/**
 * Web Audio API synthesized audio effects for tactile UI feedback and Easter Eggs.
 * Zero external audio files required, completely resilient and instant.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Perforated ticket tear noise burst
  public playTicketTear() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.18; // 180ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        // High-pass textured paper rip noise
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Ignore audio failures if autoplay policy blocks
    }
  }

  // 35mm Vintage Film Projector Start Sound (Director's Cut Easter Egg)
  public playProjectorReel() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low mechanical motor hum
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);

      // Shutter clicks (simulated 24fps sprocket click)
      for (let i = 0; i < 8; i++) {
        const clickTime = now + (i * 0.08);
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();

        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1200 - i * 60, clickTime);

        clickGain.gain.setValueAtTime(0.12, clickTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.03);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(clickTime);
        clickOsc.stop(clickTime + 0.03);
      }
    } catch {
      // Autoplay safety
    }
  }

  // Crisp tactile UI switch / flip click
  public playTactileClick(pitch = 800) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // Totoro Ghibli Melodic Chime Theme (Web Audio Music Box)
  public playTotoroMelody(): () => void {
    const ctx = this.getContext();
    if (!ctx) return () => {};

    let isPlaying = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    try {
      const notes = [
        { note: 523.25, duration: 0.35, delay: 0.0 },   // C5
        { note: 587.33, duration: 0.35, delay: 0.4 },   // D5
        { note: 659.25, duration: 0.5,  delay: 0.8 },   // E5
        { note: 783.99, duration: 0.5,  delay: 1.4 },   // G5
        { note: 659.25, duration: 0.4,  delay: 2.0 },   // E5
        { note: 523.25, duration: 0.6,  delay: 2.5 },   // C5
        
        { note: 587.33, duration: 0.35, delay: 3.2 },   // D5
        { note: 659.25, duration: 0.35, delay: 3.6 },   // E5
        { note: 587.33, duration: 0.4,  delay: 4.0 },   // D5
        { note: 440.00, duration: 0.6,  delay: 4.5 },   // A4
        { note: 523.25, duration: 0.8,  delay: 5.2 },   // C5

        // Second phrase - playful soaring
        { note: 659.25, duration: 0.35, delay: 6.2 },   // E5
        { note: 783.99, duration: 0.35, delay: 6.6 },   // G5
        { note: 880.00, duration: 0.5,  delay: 7.0 },   // A5
        { note: 1046.50, duration: 0.7, delay: 7.6 },   // C6
        { note: 880.00, duration: 0.4,  delay: 8.4 },   // A5
        { note: 783.99, duration: 0.8,  delay: 8.9 },   // G5

        // Climax thank you celebration
        { note: 880.00, duration: 0.4,  delay: 9.9 },   // A5
        { note: 987.77, duration: 0.4,  delay: 10.4 },  // B5
        { note: 1046.50, duration: 1.2, delay: 10.9 },  // C6
      ];

      notes.forEach(({ note, duration, delay }) => {
        const timeout = setTimeout(() => {
          if (!isPlaying || !this.ctx) return;
          try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(note, now);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(note * 2.01, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.6);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration + 0.7);
            osc2.stop(now + duration + 0.7);
          } catch {}
        }, delay * 1000);
        timeouts.push(timeout);
      });
    } catch {}

    return () => {
      isPlaying = false;
      timeouts.forEach(clearTimeout);
    };
  }

  // Magical sparkle burst
  public playMagicSparkle() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [880, 1108, 1318, 1760, 2093, 2637];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.06, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
