# 农场保卫战 (Farm Defender) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.
>
> **Goal:** 构建一款基于 Phaser 3 的网页塔防游戏，玩家保卫美国农场免受野生动物骚扰
>
> **Architecture:** 采用模块化架构，使用 TypeScript + Phaser 3 框架，包含敌人系统、塔楼系统、波次管理、经济系统和 UI 层。游戏循环由 Phaser 的 Scene 管理，物理使用 Arcade 物理引擎。
>
> **Tech Stack:** TypeScript, Phaser 3, Vite, GitHub Pages
>
> **Testing:** 使用 Jest 进行单元测试（游戏逻辑），手动测试游戏场景

---

## 项目结构

```
farm-defender/
├── src/
│   ├── main.ts                 # 入口文件
│   ├── game/
│   │   ├── GameScene.ts        # 主游戏场景
│   │   ├──UIScene.ts           # UI 场景
│   │   └── BootScene.ts        # 启动场景
│   ├── entities/
│   │   ├── Enemy.ts            # 敌人基类
│   │   ├── enemies/
│   │   │   ├── Boar.ts         # 野猪
│   │   │   ├── Rabbit.ts       # 野兔
│   │   ├── Tower.ts            # 塔楼基类
│   │   ├── towers/
│   │   │   ├── PistolTower.ts  # 手枪塔
│   │   │   ├── MachineGunTower.ts # 机枪塔
│   │   ├── Projectile.ts       # 子弹
│   │   └── Player.ts           # 玩家角色
│   ├── systems/
│   │   ├── EnemyManager.ts     # 敌人管理
│   │   ├── TowerManager.ts     # 塔楼管理
│   │   ├── WaveSystem.ts       # 波次系统
│   │   ├── EconomySystem.ts    # 经济系统
│   │   └── CollisionSystem.ts  # 碰撞检测
│   ├── config/
│   │   ├── constants.ts        # 游戏常量
│   │   ├── enemies.ts          # 敌人配置
│   │   ├── towers.ts           # 塔楼配置
│   │   └── levels.ts           # 关卡配置
│   └── utils/
│       └── helpers.ts          # 工具函数
├── assets/
│   ├── sprites/                # 精灵图
│   ├── audio/                  # 音效
│   └── fonts/                  # 字体
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 1: 项目搭建 (Tasks 1-4)

### Task 1: 初始化项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

**Step 1:** 创建 package.json
```json
{
  "name": "farm-defender",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.70.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Step 2:** 创建 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**Step 3:** 创建 vite.config.ts
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
```

**Step 4:** 创建 index.html
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>农场保卫战 - Farm Defender</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 5:** 安装依赖
```bash
npm install
```

**Step 6:** 验证项目可启动
```bash
npm run dev
```
预期：Vite 启动，在 http://localhost:3000 可访问

---

### Task 2: 创建游戏入口和基础场景

**Files:**
- Create: `src/main.ts`
- Create: `src/game/BootScene.ts`
- Create: `src/game/GameScene.ts`

**Step 1:** 创建 main.ts
```typescript
import Phaser from 'phaser';
import { BootScene } from './game/BootScene';
import { GameScene } from './game/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#87CEEB',
  scene: [BootScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);
```

**Step 2:** 创建 BootScene.ts
```typescript
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 加载必要的资源
    this.load.image('ground', 'assets/sprites/ground.png');
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
```

**Step 3:** 创建 GameScene.ts（临时空实现）
```typescript
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.add.text(400, 300, '农场保卫战', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
```

**Step 4:** 运行并验证
```bash
npm run dev
```
预期：浏览器显示"农场保卫战"标题

---

## Phase 2: 核心系统 (Tasks 5-10)

### Task 3: 创建游戏常量配置

**Files:**
- Create: `src/config/constants.ts`
- Create: `src/config/enemies.ts`
- Create: `src/config/towers.ts`
- Create: `src/config/levels.ts`

**Step 1:** 创建 constants.ts
```typescript
export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 32,
  MAX_LIVES: 10,
  STARTING_MONEY: 300
};

export const PATH_POINTS = [
  { x: 0, y: 150 },
  { x: 200, y: 150 },
  { x: 200, y: 400 },
  { x: 500, y: 400 },
  { x: 500, y: 200 },
  { x: 700, y: 200 },
  { x: 700, y: 500 },
  { x: 800, y: 500 }
];
```

**Step 2:** 创建 enemies.ts
```typescript
export interface EnemyConfig {
  key: string;
  name: string;
  health: number;
  speed: number;
  reward: number;
  size: number;
  color: number;
}

export const ENEMIES: Record<string, EnemyConfig> = {
  rabbit: {
    key: 'rabbit',
    name: '野兔',
    health: 20,
    speed: 150,
    reward: 10,
    size: 16,
    color: 0xD2B48C
  },
  boar: {
    key: 'boar',
    name: '野猪',
    health: 100,
    speed: 80,
    reward: 25,
    size: 24,
    color: 0x8B4513
  }
};
```

**Step 3:** 创建 towers.ts
```typescript
export interface TowerConfig {
  key: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  color: number;
}

export const TOWERS: Record<string, TowerConfig> = {
  pistol: {
    key: 'pistol',
    name: '手枪塔',
    cost: 50,
    range: 150,
    damage: 10,
    fireRate: 500,
    color: 0x4682B4
  },
  machinegun: {
    key: 'machinegun',
    name: '机枪塔',
    cost: 150,
    range: 120,
    damage: 5,
    fireRate: 100,
    color: 0x2F4F4F
  }
};
```

---

### Task 4: 实现敌人系统

**Files:**
- Create: `src/entities/Enemy.ts`
- Create: `src/entities/enemies/Rabbit.ts`
- Create: `src/entities/enemies/Boar.ts`
- Create: `src/systems/EnemyManager.ts`

**Step 1:** 编写测试（如果可能）
**Step 2:** 创建 Enemy.ts 基类
```typescript
import Phaser from 'phaser';
import { EnemyConfig } from '../config/enemies';

export class Enemy extends Phaser.GameObjects.Rectangle {
  public health: number;
  public config: EnemyConfig;
  private pathIndex: number = 0;
  private path: Array<{ x: number; y: number }>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    path: Array<{ x: number; y: number }>
  ) {
    super(scene, x, y, config.size * 2, config.size * 2, config.color);

    this.config = config;
    this.health = config.health;
    this.path = path;

    this.setCollideWorldBounds(true);
    scene.add.existing(this);
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  public update(time: number, delta: number): void {
    if (this.pathIndex >= this.path.length - 1) return;

    const target = this.path[this.pathIndex + 1];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.pathIndex++;
    } else {
      const moveX = (dx / distance) * this.config.speed * (delta / 1000);
      const moveY = (dy / distance) * this.config.speed * (delta / 1000);
      this.x += moveX;
      this.y += moveY;
    }
  }
}
```

**Step 3:** 创建 EnemyManager.ts
```typescript
import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EnemyConfig } from '../config/enemies';

export class EnemyManager {
  private enemies: Enemy[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public spawn(config: EnemyConfig, x: number, y: number, path: any[]): Enemy {
    const enemy = new Enemy(this.scene, x, y, config, path);
    this.enemies.push(enemy);
    return enemy;
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public update(time: number, delta: number): void {
    this.enemies.forEach(enemy => enemy.update(time, delta));
  }

  public onEnemyDestroyed(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }
}
```

---

### Task 5: 实现塔楼系统

**Files:**
- Create: `src/entities/Tower.ts`
- Create: `src/entities/towers/PistolTower.ts`
- Create: `src/entities/towers/MachineGunTower.ts`
- Create: `src/systems/TowerManager.ts`

**Step 1:** 创建 Tower.ts 基类
```typescript
import Phaser from 'phaser';
import { TowerConfig } from '../config/towers';
import { Enemy } from '../Enemy';

export class Tower extends Phaser.GameObjects.Container {
  public config: TowerConfig;
  public lastFireTime: number = 0;
  private rangeCircle: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y);
    this.config = config;

    // 塔楼主体
    const base = scene.add.rectangle(0, 0, 32, 32, config.color);
    this.add(base);

    // 射程范围（调试用）
    this.rangeCircle = scene.add.graphics();
    this.rangeCircle.lineStyle(1, 0xffffff, 0.3);
    this.rangeCircle.strokeCircle(0, 0, config.range);

    scene.add.existing(this);
  }

  public update(time: number, delta: number, enemies: Enemy[]): void {
    if (time < this.lastFireTime + this.config.fireRate) return;

    const target = this.findTarget(enemies);
    if (target) {
      this.fire(target);
      this.lastFireTime = time;
    }
  }

  protected findTarget(enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDistance = this.config.range;

    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, enemy.x, enemy.y
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = enemy;
      }
    }

    return closest;
  }

  protected fire(target: Enemy): void {
    // 子类实现
  }

  public showRange(show: boolean): void {
    this.rangeCircle.visible = show;
  }
}
```

---

### Task 6: 实现子弹系统

**Files:**
- Create: `src/entities/Projectile.ts`
- Create: `src/systems/CollisionSystem.ts`

**Step 1:** 创建 Projectile.ts
```typescript
import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Circle {
  private target: Enemy | null;
  private speed: number;
  private damage: number;
  private active: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    speed: number,
    damage: number
  ) {
    super(scene, x, y, 4, 0xFFFF00);

    this.target = target;
    this.speed = speed;
    this.damage = damage;

    scene.add.existing(this);
  }

  public update(time: number, delta: number): void {
    if (!this.active || !this.target || this.target.destroyed) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      this.target.takeDamage(this.damage);
      this.destroy();
    } else {
      const moveX = (dx / distance) * this.speed * (delta / 1000);
      const moveY = (dy / distance) * this.speed * (delta / 1000);
      this.x += moveX;
      this.y += moveY;
    }
  }

  public destroy(): void {
    this.active = false;
    super.destroy();
  }
}
```

---

## Phase 3: 游戏完整流程 (Tasks 7-12)

### Task 7: 实现波次系统

**Files:**
- Modify: `src/systems/WaveSystem.ts`

### Task 8: 实现经济系统

**Files:**
- Modify: `src/systems/EconomySystem.ts`

### Task 9: 实现 UI 系统

**Files:**
- Create: `src/game/UIScene.ts`

### Task 10: 整合所有系统到 GameScene

**Files:**
- Modify: `src/game/GameScene.ts`

---

## Phase 4: 美术资源与优化 (Tasks 11-14)

### Task 11: 创建占位美术资源

### Task 12: 添加动画和粒子效果

### Task 13: 性能优化

### Task 14: 部署到 GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

---

## 测试清单

- [ ] 游戏可正常启动
- [ ] 敌人能沿路径移动
- [ ] 塔楼能正确放置
- [ ] 塔楼能自动瞄准并射击
- [ ] 子弹能命中敌人并造成伤害
- [ ] 敌人死亡后掉落金币
- [ ] 可以购买新塔楼
- [ ] 波次系统正常工作
- [ ] 生命值系统正常工作
- [ ] 游戏结束条件触发

---

## 执行说明

**执行此计划时，请使用 superpowers:subagent-driven-development 技能，逐个任务执行：**

1. 每个任务遵循 TDD 原则（先写测试，再实现）
2. 每个小步骤完成后提交 git commit
3. 每个主要任务完成后进行代码审查
4. 遇到问题时及时反馈

**开始执行命令：**
```bash
npm install && npm run dev
```
