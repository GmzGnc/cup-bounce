import { LEVELS } from '../data/levels.js';

const STORAGE_KEY = 'cupbounce_level';

export class LevelManager {
  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.currentLevel = saved ? parseInt(saved, 10) : 1;
    // Clamp to valid range
    if (this.currentLevel < 1 || this.currentLevel > LEVELS.length) {
      this.currentLevel = 1;
    }
  }

  getCurrentLevelData() {
    return LEVELS[this.currentLevel - 1];
  }

  advanceLevel() {
    if (this.currentLevel < LEVELS.length) {
      this.currentLevel++;
    } else {
      this.currentLevel = 1; // Loop back to start
    }
    localStorage.setItem(STORAGE_KEY, String(this.currentLevel));
  }

  getLevel() {
    return this.currentLevel;
  }

  reset() {
    this.currentLevel = 1;
    localStorage.setItem(STORAGE_KEY, '1');
  }
}
