// Simple synthesized sound effects for chat events
class ChatAudio {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    // Initialize audio context on first user interaction
    this.init();
  }

  private async init() {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      await this.init();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    // Smooth envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Pleasant ascending chime for user join
  async userJoined() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.05);
      }, index * 100);
    });
  }

  // Gentle descending tone for user leave
  async userLeft() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const notes = [659.25, 523.25]; // E5, C5 - gentle descent
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 'sine', 0.04);
      }, index * 150);
    });
  }

  // Soft pop for new messages
  async newMessage() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Quick soft pop sound
    this.playTone(440, 0.1, 'sine', 0.03);
    setTimeout(() => {
      this.playTone(880, 0.05, 'sine', 0.02);
    }, 50);
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Check if sounds are enabled
  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const chatAudio = new ChatAudio();