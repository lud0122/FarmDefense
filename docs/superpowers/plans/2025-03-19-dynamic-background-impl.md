# 动态时间背景系统 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为GameScene创建动态时间背景系统,包含白天/黄昏/夜晚三种阶段,平滑过渡,天气粒子效果

**Architecture:** 使用层叠模式分离: SkyLayer(天空)、WeatherLayer(雨/雪)、HorizonLayer(远景)、AmbientLayer(动画),由BackgroundSystem统一控制

**Tech Stack:** Phaser 3.70 + TypeScript, 仅使用原生图形API

---

## 文件结构

| 文件 | 用途 |
|------|------|
| `src/systems/BackgroundSystem.ts` | 主控制器,管理时间和天气状态 |
| `src/systems/SkyLayer.ts` | 天空层: 渐变背景、太阳/月亮、云朵 |
| `src/systems/WeatherLayer.ts` | 天气层: 雨、雪粒子效果 |
| `src/systems/HorizonLayer.ts` | 地平线层: 远山、远景装饰 |
| `src/systems/AmbientEffects.ts` | 环境层: 风吹植物等动画 |
| `src/game/GameScene.ts` | 修改: 集成背景系统 |

---

### Task 1: SkyLayer - 最低层天空渐变

**Files:**
- Create: `src/systems/SkyLayer.ts`
- Modify: `src/game/GameScene.ts:65` (替换createBackground调用)
- Test: `src/systems/__tests__/SkyLayer.test.ts`

- [ ] **Step 1: Create SkyLayer.ts with gradient background**
  ```typescript
  export class SkyLayer {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics;
    private timeOfDay: 'day' | 'dusk' | 'night' = 'day';

    constructor(scene: Phaser.Scene) {
      this.scene = scene;
    }

    create(): void {
      this.graphics = this.scene.add.graphics();
      this.drawGradient();
    }

    setTimeOfDay(time: 'day' | 'dusk' | 'night'): void {
      // TODO: 实现过渡动画
    }

    private drawGradient(): void {
      const { width, height } = this.scene.scale;
      // 根据timeOfDay选择颜色
    }
  }
  ```

- [ ] **Step 2: Write test**
  ```typescript
  describe('SkyLayer', () => {
    test('creates gradient on init', () => {
      // Arrange
      const mockScene = createMockScene();
      const layer = new SkyLayer(mockScene);
      // Act
      layer.create();
      // Assert
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });
  });
  ```

- [ ] **Step 3: Integrate into GameScene**
  ```typescript
  private skyLayer!: SkyLayer;

  create() {
    this.skyLayer = new SkyLayer(this);
    this.skyLayer.create();
    // ... rest
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add src/systems/SkyLayer.ts
  git commit -m "feat: add SkyLayer for dynamic gradient backgrounds"
  ```

---

### Task 2: 完成四种渐变颜色实现

**Files:**
- Modify: `src/systems/SkyLayer.ts`

- [ ] **Step 1: 定义颜色配置**
  ```typescript
  const SKY_COLORS = {
    day: { top: 0x87CEEB, bottom: 0xE0F6FF },
    dusk: { top: 0xFF6B35, bottom: 0xF4A460 },
    night: { top: 0x0B1026, bottom: 0x1a1a2e }
  };
  ```

- [ ] **Step 2: 实现drawGradient方法**
  ```typescript
  private drawGradient(colors: { top: number, bottom: number }): void {
    const { width, height } = this.scene.scale;
    this.graphics.clear();
    this.graphics.fillGradientStyle(
      colors.top, colors.top,
      colors.bottom, colors.bottom
    );
    this.graphics.fillRect(0, 0, width, height);
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git commit -m "feat: implement three time-of-day gradients"
  ```

---

### Task 3: 添加云朵效果

**Files:**
- Modify: `src/systems/SkyLayer.ts`

- [ ] **Step 1: 创建云朵类**
  ```typescript
  class Cloud {
    constructor(scene: Phaser.Scene, x: number, y: number) {
      // 用多个白色圆形组成云朵
    }
    update(delta: number): void {
      // 水平移动
    }
  }
  ```

- [ ] **Step 2: 在SkyLayer中管理云朵**
  ```typescript
  private clouds: Cloud[] = [];
  createClouds(count: number): void {
    for (let i = 0; i < count; i++) {
      this.clouds.push(new Cloud(...));
    }
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git commit -m "feat: add animated clouds to sky layer"
  ```

---

### Task 4: WeatherLayer - 雨雪粒子

**Files:**
- Create: `src/systems/WeatherLayer.ts`

- [ ] **Step 1: 创建WeatherLayer类**
  ```typescript
  export class WeatherLayer {
    private particles: Phaser.GameObjects.Particles.ParticleEmitterManager | null = null;

    createRain(): void {
      // 使用线条粒子模拟雨
    }

    createSnow(): void {
      // 使用圆形粒子模拟雪
    }

    clear(): void {
      // 清除粒子
    }
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add src/systems/WeatherLayer.ts
  git commit -m "feat: add WeatherLayer with rain and snow particles"
  ```

---

### Task 5: HorizonLayer - 远山远景

**Files:**
- Create: `src/systems/HorizonLayer.ts`

- [ ] **Step 1: 创建HorizonLayer**
  ```typescript
  export class HorizonLayer {
    createMountains(): void {
      // 使用Graphics绘制多边形山脉
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x4B5567, 1);
      // 绘制山形...
    }
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add src/systems/HorizonLayer.ts
  git commit -m "feat: add HorizonLayer with mountains"
  ```

---

### Task 6: AmbientEffects - 风吹动画

**Files:**
- Create: `src/systems/AmbientEffects.ts`

- [ ] **Step 1: 创建风吹效果**
  ```typescript
  export class AmbientEffects {
    addWindEffect(target: Phaser.GameObjects.Text): void {
      // Tween左右摆动
    }
  }
  ```

- [ ] **Step 2: 应用到现有emoji**
  ```typescript
  // 对花、草、树添加摆动
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/systems/AmbientEffects.ts
  git commit -m "feat: add ambient wind animations to plants"
  ```

---

### Task 7: BackgroundSystem - 主控制器

**Files:**
- Create: `src/systems/BackgroundSystem.ts`
- Modify: `src/game/GameScene.ts` (替换背景初始化)

- [ ] **Step 1: 创建BackgroundSystem协调器**
  ```typescript
  export class BackgroundSystem {
    private skyLayer: SkyLayer;
    private weatherLayer: WeatherLayer;
    private horizonLayer: HorizonLayer;
    private ambientEffects: AmbientEffects;

    constructor(scene: GameScene) {
      // 初始化所有层
    }

    create(): void {
      // 创建各层并设置层级顺序
    }

    setTimeOfDay(time: TimeOfDay): void {
      this.skyLayer.setTimeOfDay(time);
      // 同步更新其他层
    }
  }
  ```

- [ ] **Step 2: 修改GameScene整合**
  ```typescript
  private backgroundSystem!: BackgroundSystem;

  create() {
    // 替换现有的createBackground调用
    this.backgroundSystem = new BackgroundSystem(this);
    this.backgroundSystem.create();

    // 在关卡开始时设置时间
    this.backgroundSystem.setTimeOfDay(
      this.currentLevel % 3 === 0 ? 'day' :
      this.currentLevel % 3 === 1 ? 'dusk' : 'night'
    );
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git commit -m "feat: integrate BackgroundSystem into GameScene"
  ```

---

### Task 8: 时间过渡动画

**Files:**
- Modify: `src/systems/SkyLayer.ts`
- Modify: `src/systems/BackgroundSystem.ts`

- [ ] **Step 1: 实现Tween渐变**
  ```typescript
  transitionToTime(targetTime: TimeOfDay): void {
    const startColors = SKY_COLORS[this.timeOfDay];
    const endColors = SKY_COLORS[targetTime];

    this.scene.tweens.addCounter({
      from: 0, to: 1, duration: 2000,
      onUpdate: (tween) => {
        const progress = tween.getValue();
        this.interpolateColors(startColors, endColors, progress);
      }
    });
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git commit -m "feat: add smooth time transition animation"
  ```

---

### Task 9: 测试和优化

**Files:**
- Create: `src/test/BackgroundSystem.test.ts`

- [ ] **Step 1: 编写集成测试**
  ```typescript
  test('transitions between day and night', async () => {
    const bg = new BackgroundSystem(mockScene);
    bg.create();
    bg.setTimeOfDay('night');
    await wait(2100);
    expect(...).toBe('night');
  });
  ```

- [ ] **Step 2: 性能检查**
  - 确保60fps
  - 移动端测试
  - 内存泄漏检查

- [ ] **Step 3: Commit**
  ```bash
  git commit -m "test: add BackgroundSystem integration tests"
  ```

---

## 验证清单

- [ ] 白天/黄昏/夜晚三种渐变显示正确
- [ ] 云朵水平飘动动画流畅
- [ ] 时间切换时渐变过渡平滑
- [ ] 雨雪粒子效果正常
- [ ] 植被有风吹摆动效果
- [ ] 60fps性能达标
- [ ] 移动端显示正常
- [ ] TypeScript无错误
