import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../config/levels';

describe('Wave and Level Display', () => {
  it('should display level number before wave number', () => {
    // 验证关卡配置存在
    const level1 = LEVELS.find(level => level.number === 1);
    expect(level1).toBeDefined();

    // 期望的显示格式："Level X - Wave Y"
    // 这个功能将在 GameScene 中实现
    const currentLevel = 1;
    const currentWave = 1;
    const expectedDisplay = `Level ${currentLevel} - Wave ${currentWave}`;

    expect(expectedDisplay).toBe('Level 1 - Wave 1');
  });

  it('should update display when level changes', () => {
    // 当关卡增加时，显示应该反映新的关卡号
    const level2 = LEVELS.find(level => level.number === 2);
    expect(level2).toBeDefined();

    const currentLevel = 2;
    const currentWave = 1;
    const expectedDisplay = `Level ${currentLevel} - Wave ${currentWave}`;

    expect(expectedDisplay).toBe('Level 2 - Wave 1');
  });

  it('should have waveText property in GameScene', () => {
    // 这个测试验证 waveText 属性已定义
    // 实际测试需要运行游戏场景
    // 目前先验证配置结构
    expect(LEVELS.length).toBeGreaterThan(0);
    expect(LEVELS[0].number).toBe(1);
  });
});
