import Phaser from 'phaser';
import { EnemyManager } from '../systems/EnemyManager';
import { TowerManager } from '../systems/TowerManager';
import { EconomySystem } from '../systems/EconomySystem';
import { PATH_POINTS, GAME_CONFIG } from '../config/constants';
import { ENEMIES } from '../config/enemies';
import { TOWERS } from '../config/towers';

export class GameScene extends Phaser.Scene {
  private enemyManager!: EnemyManager;
  private towerManager!: TowerManager;
  private economySystem!: EconomySystem;
  private lives: number = GAME_CONFIG.MAX_LIVES;
  private livesText!: Phaser.GameObjects.Text;
  private projectiles: Phaser.GameObjects.GameObject[] = [];
  private waveInProgress: boolean = false;
  private currentWave: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 绘制背景
    this.createBackground();

    // 绘制敌人路径
    this.createPath();

    // 初始化系统
    this.economySystem = new EconomySystem(
      this,
      GAME_CONFIG.STARTING_MONEY,
      (money) => console.log('Money changed:', money)
    );
    this.economySystem.createUI(20, 20);

    this.enemyManager = new EnemyManager(
      this,
      PATH_POINTS,
      (reward) => this.economySystem.addMoney(reward),
      () => this.onEnemyReachEnd()
    );

    this.towerManager = new TowerManager(this);

    // 创建 UI
    this.createUI();

    // 放置一些初始塔楼（测试用）
    this.placeInitialTowers();

    // 开始第一波
    this.startNextWave();

    // 输入处理
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer);
    });
  }

  private createBackground(): void {
    // 草地背景
    const ground = this.add.rectangle(400, 300, 800, 600, 0x228B22);
    ground.setDepth(-1);

    // 添加一些装饰性的草地纹理
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.Between(2, 5);
      this.add.circle(x, y, size, 0x2E8B57).setDepth(-1);
    }
  }

  private createPath(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(24, 0xD2B48C);

    // 绘制路径
    graphics.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i++) {
      graphics.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    graphics.strokePath();

    // 路径边框
    graphics.lineStyle(2, 0x8B4513);
    graphics.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i++) {
      graphics.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    graphics.strokePath();
  }

  private createUI(): void {
    // 生命值
    this.livesText = this.add.text(700, 20, `❤️ ${this.lives}`, {
      fontSize: '24px',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 2
    });

    // 波次信息
    this.add.text(400, 20, `Wave ${this.currentWave + 1}`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5, 0);

    // 塔楼选择面板（底部）
    const towerPanel = this.add.rectangle(400, 560, 800, 80, 0x333333);
    towerPanel.setAlpha(0.8);

    // 显示可用塔楼
    const towerKeys = Object.keys(TOWERS);
    towerKeys.forEach((key, index) => {
      const tower = TOWERS[key];
      const x = 100 + index * 120;
      const y = 560;

      // 塔楼按钮背景
      const btn = this.add.rectangle(x, y, 100, 60, 0x555555).setInteractive();

      // 塔楼名称
      this.add.text(x, y - 15, tower.name, {
        fontSize: '14px',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      // 价格
      this.add.text(x, y + 10, `$${tower.cost}`, {
        fontSize: '16px',
        color: '#FFD700'
      }).setOrigin(0.5);

      // 点击事件
      btn.on('pointerdown', () => {
        this.selectTower(key);
      });
    });
  }

  private selectedTowerKey: string | null = null;

  private selectTower(towerKey: string): void {
    this.selectedTowerKey = towerKey;
    console.log('Selected tower:', towerKey);
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    if (this.selectedTowerKey) {
      const tower = TOWERS[this.selectedTowerKey];
      if (this.economySystem.canAfford(tower.cost)) {
        if (this.economySystem.spendMoney(tower.cost)) {
          this.towerManager.placeTower(pointer.x, pointer.y, this.selectedTowerKey);
        }
      } else {
        console.log('Not enough money!');
      }
    }
  }

  private placeInitialTowers(): void {
    // 在路径关键位置放置几个塔楼（测试用）
    this.towerManager.placeTower(300, 250, 'pistol');
    this.towerManager.placeTower(500, 350, 'machinegun');
  }

  private startNextWave(): void {
    if (this.waveInProgress) return;

    this.waveInProgress = true;
    this.currentWave++;

    // 生成敌人波次
    const waveConfig = [
      { config: ENEMIES.rabbit, count: 5, interval: 1500 },
      { config: ENEMIES.rabbit, count: 3, interval: 1000 },
      { config: ENEMIES.boar, count: 2, interval: 2000 }
    ];

    this.enemyManager.spawnWave(waveConfig);

    // 波次完成后检查
    this.time.delayedCall(30000, () => {
      this.waveInProgress = false;
      if (this.enemyManager.getEnemyCount() === 0) {
        console.log('Wave complete!');
        // 可以添加波次间休整时间，然后自动开始下一波
        this.time.delayedCall(5000, () => {
          this.startNextWave();
        });
      }
    });
  }

  private onEnemyReachEnd(): void {
    this.lives--;
    this.livesText.setText(`❤️ ${this.lives}`);

    // 生命值动画
    this.tweens.add({
      targets: this.livesText,
      scale: 1.5,
      duration: 200,
      yoyo: true
    });

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.add.text(400, 300, '游戏结束', {
      fontSize: '64px',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.scene.pause();
  }

  update(time: number, delta: number): void {
    // 更新敌人
    this.enemyManager.update(time, delta);

    // 更新塔楼
    this.towerManager.update(time, delta, this.enemyManager.getEnemies());

    // 更新子弹
    this.updateProjectiles(time, delta);
  }

  private updateProjectiles(time: number, delta: number): void {
    // 遍历所有活跃的子弹（由 Tower.fire 返回的对象）
    // 由于 Projectile 是自包含的更新逻辑，这里不需要额外处理
    // 但我们需要清理已销毁的子弹

    // 实际上，Projectile 应该作为数组在 TowerManager 中管理
    // 简化起见，我们让子弹自己管理更新
  }
}
