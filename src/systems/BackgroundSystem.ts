import Phaser from 'phaser';
import { SkyLayer, TimeOfDay } from './SkyLayer.js';
import { WeatherLayer, WeatherType } from './WeatherLayer.js';
import { HorizonLayer } from './HorizonLayer.js';
import { AmbientEffects } from './AmbientEffects.js';

export type { TimeOfDay, WeatherType };

interface BackgroundConfig {
  startTime?: TimeOfDay;
  startWeather?: WeatherType;
  cloudCount?: number;
  enableStars?: boolean;
  enableFireflies?: boolean;
}

export class BackgroundSystem {
  // Scene reference - used by AmbientEffects for star/firefly creation
  private scene: Phaser.Scene;
  private skyLayer: SkyLayer;
  private weatherLayer: WeatherLayer;
  private horizonLayer: HorizonLayer;
  private ambientEffects: AmbientEffects;

  private currentTime: TimeOfDay = 'day';
  private currentWeather: WeatherType = 'clear';
  private levelIndex: number = 0;


  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.skyLayer = new SkyLayer(scene);
    this.weatherLayer = new WeatherLayer(scene);
    this.horizonLayer = new HorizonLayer(scene);
    this.ambientEffects = new AmbientEffects(scene);
  }

  create(config: BackgroundConfig = {}): void {
    // Create layers in order (back to front)
    this.skyLayer.create();
    this.horizonLayer.create();
    this.weatherLayer.create();
    this.ambientEffects.create();

    // Set initial time
    const startTime = config.startTime || 'day';
    this.setTimeOfDay(startTime);

    // Set initial weather
    const startWeather = config.startWeather || 'clear';
    this.setWeather(startWeather);

    // Create stars for night scenes
    if (this.scene && config.enableStars !== false) {
      this.ambientEffects.createStars();
    }

    // Create birds
    this.ambientEffects.createFlyingBirds(3);

    // Apply time-of-day specific ambient effects
    this.updateAmbientEffects();
  }

  /**
   * Call this in the scene's update loop
   */
  update(time: number, delta: number): void {
    this.skyLayer.update(time, delta);
    this.weatherLayer.update(time, delta);
    this.ambientEffects.update(time, delta);
  }

  /**
   * Set the time of day with smooth transition
   */
  setTimeOfDay(time: TimeOfDay): void {
    if (this.currentTime === time) return;

    const previousTime = this.currentTime;
    this.currentTime = time;

    // Update all layers
    this.skyLayer.setTimeOfDay(time);
    this.horizonLayer.setTimeOfDay(time);

    // Handle time-specific effects
    this.updateAmbientEffects();

    // If transitioning to night, ensure we have fireflies
    if (time === 'night' && previousTime !== 'night') {
      this.ambientEffects.createFireflies(15);
    }

    console.log(`[BackgroundSystem] Time changed: ${previousTime} -> ${time}`);
  }

  /**
   * Set the current weather
   */
  setWeather(weather: WeatherType): void {
    if (this.currentWeather === weather) return;

    this.currentWeather = weather;
    this.weatherLayer.setWeather(weather);

    console.log(`[BackgroundSystem] Weather changed: ${weather}`);
  }

  /**
   * Get current time of day
   */
  getTimeOfDay(): TimeOfDay {
    return this.currentTime;
  }

  /**
   * Get current weather
   */
  getWeather(): WeatherType {
    return this.currentWeather;
  }

  /**
   * Set time based on level index (cycles through day/dusk/night)
   */
  setTimeByLevel(levelIndex: number): void {
    this.levelIndex = levelIndex;
    const timeIndex = levelIndex % 3;
    const times: TimeOfDay[] = ['day', 'dusk', 'night'];
    this.setTimeOfDay(times[timeIndex]);
  }

  /**
   * Transition to next time of day
   */
  transitionToNextTime(): void {
    const times: TimeOfDay[] = ['day', 'dusk', 'night'];
    const currentIndex = times.indexOf(this.currentTime);
    const nextIndex = (currentIndex + 1) % times.length;
    this.setTimeOfDay(times[nextIndex]);
  }

  /**
   * Get information about the current background state
   */
  getStats(): {
    time: TimeOfDay;
    weather: WeatherType;
    levelIndex: number;
  } {
    return {
      time: this.currentTime,
      weather: this.currentWeather,
      levelIndex: this.levelIndex
    };
  }

  private updateAmbientEffects(): void {
    // Adjust tints based on time of day
    // Could apply tints to game objects here if needed
    void this.getTimeOfDayTint();
  }

  private getTimeOfDayTint(): number {
    switch (this.currentTime) {
      case 'day':
        return 0xFFFFFF;
      case 'dusk':
        return 0xFFE4B5;
      case 'night':
        return 0x8888AA;
      default:
        return 0xFFFFFF;
    }
  }

  /**
   * Apply ambient animation swaying to plant emojis
   * Call this with the array of decorative plant text objects
   */
  applyWindEffect(plants: Phaser.GameObjects.Text[]): void {
    // Filter to only include flower/grass/tree emojis
    const plantEmojis = /[\u{1F300}-\u{1F9FF}]/u;
    const validPlants = plants.filter(p => plantEmojis.test(p.text));
    this.ambientEffects.addSwayingPlants(validPlants, 1.5, 2);
  }

  destroy(): void {
    this.skyLayer.destroy();
    this.weatherLayer.destroy();
    this.horizonLayer.destroy();
    this.ambientEffects.destroy();
  }
}
