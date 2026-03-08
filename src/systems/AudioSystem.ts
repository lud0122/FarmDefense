import Phaser from 'phaser';

export class AudioSystem {
  private muted: boolean = false;
  private volume: number = 0.5;

  constructor(_scene: Phaser.Scene) {
    // Constructor is empty, using Web Audio API directly
  }

  public preload(): void {
    // 使用程序化生成的音效，无需外部文件
  }

  public create(): void {
    // 初始化音效系统
  }

  // 播放射击音效
  public playShootSound(): void {
    if (this.muted) return;
    this.playToneSound(800, 0.1, 100, 'square');
  }

  // 播放爆炸音效
  public playExplosionSound(): void {
    if (this.muted) return;
    this.playNoiseSound(0.3, 500, 50);
  }

  // 播放命中音效
  public playHitSound(): void {
    if (this.muted) return;
    this.playToneSound(400, 0.05, 50, 'sine');
  }

  // 播放金币音效
  public playCoinSound(): void {
    if (this.muted) return;
    this.playToneSound(1200, 0.08, 150, 'sine');
    setTimeout(() => this.playToneSound(1600, 0.05, 100, 'sine'), 50);
  }

  // 播放敌人生成音效
  public playSpawnSound(): void {
    if (this.muted) return;
    this.playToneSound(200, 0.15, 200, 'sawtooth');
  }

  // 播放升级音效
  public playUpgradeSound(): void {
    if (this.muted) return;
    this.playToneSound(600, 0.1, 100, 'sine');
    setTimeout(() => this.playToneSound(800, 0.1, 100, 'sine'), 100);
    setTimeout(() => this.playToneSound(1000, 0.15, 150, 'sine'), 200);
  }

  // 播放游戏结束音效
  public playGameOverSound(): void {
    if (this.muted) return;
    this.playToneSound(300, 0.3, 500, 'sawtooth');
    setTimeout(() => this.playToneSound(200, 0.4, 800, 'sawtooth'), 200);
  }

  // 播放胜利音效
  public playVictorySound(): void {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C
    notes.forEach((freq, index) => {
      setTimeout(() => this.playToneSound(freq, 0.2, 200, 'sine'), index * 150);
    });
  }

  // 播放UI点击音效
  public playClickSound(): void {
    if (this.muted) return;
    this.playToneSound(1000, 0.03, 50, 'sine');
  }

  // 程序化生成音调
  private playToneSound(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType
  ): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Apply volume setting
    const adjustedVolume = (volume / 1000) * this.volume;
    gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // 程序化生成噪音（用于爆炸）
  private playNoiseSound(duration: number, volume: number, frequency: number): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = audioContext.createGain();
    const adjustedVolume = (volume / 1000) * this.volume;
    gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    // Add lowpass filter for explosion sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, audioContext.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(audioContext.currentTime);
  }

  // 播放背景音乐（简单的节奏）
  public startBGM(): void {
    if (this.muted) return;
    this.playBGMBeat();
  }

  // 停止背景音乐
  public stopBGM(): void {
    // Background music is handled by intervals, stops when muted
  }

  private playBGMBeat(): void {
    if (this.muted) return;
    // Simple beat every 2 seconds
    setInterval(() => {
      if (!this.muted) {
        this.playToneSound(100, 0.2, 300, 'triangle');
      }
    }, 2000);
  }

  // 静音切换
  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public setMute(mute: boolean): void {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // 设置音量
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }
}
