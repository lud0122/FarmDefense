import Phaser from 'phaser';
import { EnemyManager } from '../systems/EnemyManager';
import { TowerManager } from '../systems/TowerManager';
import { ProjectileManager } from '../systems/ProjectileManager';
import { EconomySystem } from '../systems/EconomySystem';
import { PATH_POINTS, GAME_CONFIG } from '../config/constants';
import { ENEMIES } from '../config/enemies';
import { TOWERS } from '../config/towers';
import { LEVELS } from '../config/levels';

import { AudioSystem } from '../systems/AudioSystem';
import { PlayerHelicopter } from '../entities/PlayerHelicopter';

export class GameScene extends Phaser.Scene {
  private enemyManager!: EnemyManager;
  private towerManager!: TowerManager;
  private projectileManager!: ProjectileManager;
  private economySystem!: EconomySystem;
  private audioSystem!: AudioSystem;
  private playerHelicopter!: PlayerHelicopter;
  private lives: number = GAME_CONFIG.MAX_LIVES;
  private livesText!: Phaser.GameObjects.Text;
  private waveInProgress: boolean = false;
  private currentWave: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 初始化音效系统
    this.audioSystem = new AudioSystem(this);
    this.audioSystem.create();

    // 绘制背景
    this.createBackground();

    // 绘制敌人路径
    this.createPath();

    // 初始化系统
    this.economySystem = new EconomySystem(
      this,
      GAME_CONFIG.STARTING_MONEY,
      (_money) => {
        // Money change callback
      }
    );
    this.economySystem.createUI(20, 20);

    this.enemyManager = new EnemyManager(
      this,
      PATH_POINTS,
      (reward) => {
        this.economySystem.addMoney(reward);
        this.audioSystem.playCoinSound();
      },
      () => this.onEnemyReachEnd()
    );

    this.towerManager = new TowerManager(this);
    this.projectileManager = new ProjectileManager(this);

    // 创建玩家直升机
    this.playerHelicopter = new PlayerHelicopter(this, 400, 300);

    // 创建 UI
    this.createUI();

    // Disable context menu on game canvas
    this.input.mouse?.disableContextMenu();

    // Keyboard shortcuts for tower selection (1-6) - 必须在UI创建后初始化
    this.setupKeyboardShortcuts();
    this.createUI();

    // 放置一些初始塔楼（测试用）
    this.placeInitialTowers();

    // 开始第一波
    this.startNextWave();

    // 输入处理
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer);
    });

    // 右键点击空白处隐藏回收菜单
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2) {
        // Check if clicked on empty space (not on a tower)
        const clickedTower = this.towerManager.getTowers().some(
          tower => Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, tower.x, tower.y) < 30
        );
        if (!clickedTower) {
          this.hideTowerRecycleMenu();
        }
      }
    });

    // 启动背景音乐
    this.audioSystem.startBGM();
  }

  private createBackground(): void {
    // 整体农场背景
    this.add.rectangle(400, 300, 800, 600, 0x7CB342).setDepth(-10);

    // 创建不同的作物区域
    this.createCropZones();

    // 添加农田边缘（栅栏）
    this.createFarmFences();

    // 添加装饰元素（稻草人、水桶等）
    this.createFarmDecorations();
  }

  private createCropZones(): void {
    // 每个作物区域用一个emoji文本和背景表示
    const cropZones = [
      { x: 100, y: 100, width: 150, height: 120, type: '🌽', name: '玉米地', color: 0xFFF8E1 },
      { x: 700, y: 100, width: 150, height: 120, type: '🌾', name: '麦田', color: 0xFFE082 },
      { x: 100, y: 500, width: 150, height: 80, type: '🥕', name: '菜园', color: 0xFFCC80 },
      { x: 700, y: 500, width: 150, height: 80, type: '🍎', name: '果园', color: 0xFFAB91 }
    ];

    for (const zone of cropZones) {
      // 区域背景
      const bg = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, zone.color);
      bg.setDepth(-5);
      bg.setAlpha(0.6);

      // 作物emoji
      const rows = Math.floor(zone.height / 30);
      const cols = Math.floor(zone.width / 30);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.add.text(
            zone.x - zone.width / 2 + 15 + c * 30,
            zone.y - zone.height / 2 + 15 + r * 30,
            zone.type,
            { fontSize: '20px' }
          ).setOrigin(0.5).setDepth(-4);
        }
      }

      // 区域标签
      this.add.text(zone.x, zone.y + zone.height / 2 + 10, zone.name, {
        fontSize: '12px',
        color: '#5D4037',
        backgroundColor: '#FFFFFF',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(-3);
    }
  }

  private createFarmFences(): void {
    // 创建简单的木栅栏效果
    const fenceEmoji = '🚧';

    // 顶部边缘
    for (let x = 40; x < 760; x += 80) {
      if (x < 100 || x > 650) { // 留出路径入口
        this.add.text(x, 30, fenceEmoji, { fontSize: '30px' }).setOrigin(0.5).setDepth(-2);
      }
    }

    // 底部边缘
    for (let x = 40; x < 760; x += 80) {
      if (x < 200 || x > 600) { // 留出路径出口
        this.add.text(x, 480, fenceEmoji, { fontSize: '30px' }).setOrigin(0.5).setDepth(-2);
      }
    }

    // 左侧边缘
    for (let y = 60; y < 500; y += 60) {
      if (y < 100 || y > 400) {
        this.add.text(30, y, fenceEmoji, { fontSize: '30px' }).setOrigin(0.5).setDepth(-2);
      }
    }

    // 右侧边缘
    for (let y = 60; y < 500; y += 60) {
      if (y < 100 || y > 400) {
        this.add.text(770, y, fenceEmoji, { fontSize: '30px' }).setOrigin(0.5).setDepth(-2);
      }
    }
  }

  private createFarmDecorations(): void {
    // 谷仓
    this.add.text(80, 45, '🏠', { fontSize: '60px' }).setOrigin(0.5).setDepth(-2);

    // 风车
    this.add.text(720, 45, '💨', { fontSize: '50px' }).setOrigin(0.5).setDepth(-2);

    // 稻草人
    this.add.text(300, 100, '🧙‍♂️', { fontSize: '40px' }).setOrigin(0.5).setDepth(-2);

    // 水桶
    this.add.text(500, 100, '🪣', { fontSize: '30px' }).setOrigin(0.5).setDepth(-2);

    // 水桶
    this.add.text(200, 450, '🪣', { fontSize: '30px' }).setOrigin(0.5).setDepth(-2);

    // 树
    this.add.text(650, 500, '🌲', { fontSize: '40px' }).setOrigin(0.5).setDepth(-2);

    // 草地装饰
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(250, 550);
      const y = Phaser.Math.Between(250, 400);
      this.add.text(x, y, '🌿', { fontSize: '15px' }).setOrigin(0.5).setDepth(-6);
    }

    // 花
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(200, 600);
      const y = Phaser.Math.Between(150, 350);
      const flowers = ['🌻', '🌷', '🌹'];
      this.add.text(x, y, flowers[Math.floor(Math.random() * flowers.length)], { fontSize: '18px' }).setOrigin(0.5).setDepth(-5);
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
    // Toggle: if clicking the same tower, deselect it
    if (this.selectedTowerKey === towerKey) {
      this.selectedTowerKey = null;
      this.audioSystem.playClickSound();
      console.log('Deselected tower');
      return;
    }

    this.selectedTowerKey = towerKey;
    this.audioSystem.playClickSound();
    console.log('Selected tower:', towerKey);

    // Deselect all towers when selecting a new one
    for (const tower of this.towerManager.getTowers()) {
      tower.showSelected(false);
    }
  }

  private setupKeyboardShortcuts(): void {
    const towerKeys = Object.keys(TOWERS);
    const keyCodes = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
      Phaser.Input.Keyboard.KeyCodes.SIX
    ];

    // Set up number keys 1-6 for tower selection
    for (let i = 0; i < Math.min(towerKeys.length, keyCodes.length); i++) {
      const key = this.input.keyboard!.addKey(keyCodes[i]);
      key.on('down', () => {
        this.selectTower(towerKeys[i]);
      });
    }

    // ESC key to deselect
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => {
      if (this.selectedTowerKey) {
        this.selectedTowerKey = null;
        this.audioSystem.playClickSound();
        console.log('Deselected tower (ESC)');
      }
    });
  }

  public showTowerRecycleMenu(tower: any): void {
    // Hide previous menu if exists
    this.hideTowerRecycleMenu();

    // Mark this tower as selected
    (this as any).selectedTower = tower;
    tower.showSelected(true);

    const recycleValue = tower.getRecycleValue();

    // Create menu background
    const menuX = tower.x;
    const menuY = tower.y - 50;
    const menuBg = this.add.rectangle(menuX, menuY, 120, 60, 0x333333);
    menuBg.setStrokeStyle(2, 0xFFD700);
    menuBg.setDepth(100);

    // Recycle text
    const recycleText = this.add.text(menuX, menuY - 15, '♻️ 回收塔楼', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(101);

    // Value text
    const valueText = this.add.text(menuX, menuY + 10, `$${recycleValue} (${Math.floor(tower.originalCost * 0.5)})`, {
      fontSize: '16px',
      color: '#FFD700'
    }).setOrigin(0.5).setDepth(101);

    // Store menu elements
    (this as any).recycleMenu = [menuBg, recycleText, valueText];

    // Track this tower in scene
    (this as any).selectedTower = tower;

    // Make menu clickable
    menuBg.setInteractive();
    menuBg.on('pointerdown', () => {
      this.recycleTower(tower, recycleValue);
    });

    // Make menu disappear after 3 seconds
    this.time.delayedCall(3000, () => {
      this.hideTowerRecycleMenu();
    });
  }

  private hideTowerRecycleMenu(): void {
    const menu = (this as any).recycleMenu;
    if (menu) {
      for (const element of menu) {
        if (element.active) {
          element.destroy();
        }
      }
      (this as any).recycleMenu = null;
    }

    // Deselect tower
    const tower = (this as any).selectedTower;
    if (tower && tower.active) {
      tower.showSelected(false);
    }
    (this as any).selectedTower = null;
  }

  private recycleTower(tower: any, value: number): void {
    // Hide menu
    this.hideTowerRecycleMenu();

    // Add money
    this.economySystem.addMoney(value);

    // Play coin sound
    this.audioSystem.playCoinSound();

    // Remove tower
    this.towerManager.removeTower(tower);

    // Show recycle effect
    const recycleText = this.add.text(tower.x, tower.y - 20, `+$${value}`, {
      fontSize: '20px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: recycleText,
      y: tower.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => recycleText.destroy()
    });
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    if (this.selectedTowerKey) {
      // Check if clicked on empty space (not on the tower selection panel at bottom)
      const clickedTowerPanel = pointer.y > 520;
      const clickedExistingTower = this.towerManager.getTowers().some(
        tower => Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, tower.x, tower.y) < 30
      );

      // If clicked on empty space, deselect the tower
      if (!clickedTowerPanel && !clickedExistingTower) {
        // Deselect current tower selection
        this.selectedTowerKey = null;
        this.audioSystem.playClickSound();
        console.log('Deselected tower (clicked on empty space)');
        return;
      }

      // Place tower if clicked on valid empty space
      if (!clickedTowerPanel) {
        const tower = TOWERS[this.selectedTowerKey];
        if (this.economySystem.canAfford(tower.cost)) {
          if (this.economySystem.spendMoney(tower.cost)) {
            this.towerManager.placeTower(pointer.x, pointer.y, this.selectedTowerKey);
            // After placing, you can choose to keep selected or deselect
            // this.selectedTowerKey = null; // Uncomment to deselect after placing
          }
        } else {
          console.log('Not enough money!');
          // Deselect if can't afford
          this.selectedTowerKey = null;
        }
      }
    }
  }

  private placeInitialTowers(): void {
    // 在路径关键位置放置几个塔楼（测试用）
    this.towerManager.placeTower(300, 250, 'pistol');
    this.towerManager.placeTower(500, 350, 'machinegun');
  }

  private currentLevel: number = 0;

  private startNextWave(): void {
    if (this.waveInProgress) return;

    const level = LEVELS[this.currentLevel];
    if (!level) {
      // 所有关卡完成
      console.log('All levels complete!');
      return;
    }

    if (this.currentWave >= level.waves.length) {
      // 当前关卡完成，进入下一关
      this.currentLevel++;
      this.currentWave = 0;
      console.log(`Level ${this.currentLevel} complete!`);
      this.startNextWave();
      return;
    }

    this.waveInProgress = true;
    this.currentWave++;

    // 获取当前波次配置
    const waveConfig = level.waves[this.currentWave - 1];

    // 转换为EnemyManager需要的格式
    const enemyConfigs = waveConfig.map(w => ({
      config: ENEMIES[w.enemyKey],
      count: w.count,
      interval: w.interval
    }));

    this.enemyManager.spawnWave(enemyConfigs);

    // 播放波次开始音效
    this.audioSystem.playSpawnSound();

    // 波次完成后检查（动态计算检查时间）
    const totalSpawnTime = waveConfig.reduce((max, w) => {
      return Math.max(max, w.count * w.interval);
    }, 0);

    const checkDelay = Math.max(totalSpawnTime + 10000, 30000);

    this.time.delayedCall(checkDelay, () => {
      this.waveInProgress = false;
      if (this.enemyManager.getEnemyCount() === 0) {
        console.log('Wave complete!');
        // 波次间休整时间
        this.time.delayedCall(3000, () => {
          this.startNextWave();
        });
      } else {
        // 还有敌人存活，继续检查
        this.checkWaveComplete();
      }
    });
  }

  private checkWaveComplete(): void {
    if (this.enemyManager.getEnemyCount() === 0) {
      this.waveInProgress = false;
      console.log('Wave complete!');
      this.time.delayedCall(3000, () => {
        this.startNextWave();
      });
    } else {
      // 继续检查
      this.time.delayedCall(5000, () => {
        this.checkWaveComplete();
      });
    }
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
    // 切换到游戏结束场景
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.launch('GameOverScene', { victory: false });
    });
  }

  // 胜利处理方法 - 将在后续版本中实现
  // private handleVictory(): void {
  //   this.cameras.main.fadeOut(500);
  //   this.cameras.main.once('camerafadeoutcomplete', () => {
  //     this.scene.launch('GameOverScene', { victory: true });
  //   });
  // }

  update(time: number, delta: number): void {
    // 更新敌人
    this.enemyManager.update(time, delta);

    // 更新塔楼并发射子弹
    const newProjectiles = this.towerManager.update(time, delta, this.enemyManager.getEnemies());
    for (const projectile of newProjectiles) {
      this.projectileManager.addProjectile(projectile);
    }

    // 更新玩家直升机并发射子弹
    const helicopterProjectile = this.playerHelicopter.update(time, delta, this.enemyManager.getEnemies());
    if (helicopterProjectile) {
      this.projectileManager.addProjectile(helicopterProjectile);
    }

    // 更新子弹
    this.projectileManager.update(time, delta);
  }
}
