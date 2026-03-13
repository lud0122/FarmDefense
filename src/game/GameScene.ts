import Phaser from 'phaser';
import { EnemyManager } from '../systems/EnemyManager';
import { TowerManager } from '../systems/TowerManager';
import { ProjectileManager } from '../systems/ProjectileManager';
import { EconomySystem } from '../systems/EconomySystem';
import { CropManager } from '../systems/CropManager';
import { PATH_POINTS, GAME_CONFIG } from '../config/constants';
import { ENEMIES } from '../config/enemies';
import { TOWERS } from '../config/towers';
import { LEVELS } from '../config/levels';
import { Pathfinding } from '../utils/Pathfinding';

import { AudioSystem } from '../systems/AudioSystem';
import { PlayerHelicopter } from '../entities/PlayerHelicopter';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { MobileToolbar } from '../ui/MobileToolbar';
import { MobileTowerPanel } from '../ui/MobileTowerPanel';
import { isMobile } from '../utils/MobileDetect';

export class GameScene extends Phaser.Scene {
  private enemyManager!: EnemyManager;
  private towerManager!: TowerManager;
  private cropManager!: CropManager; // Level 5
  private projectileManager!: ProjectileManager;
  private economySystem!: EconomySystem;
  private audioSystem!: AudioSystem;
  private playerHelicopter!: PlayerHelicopter;
  private lives: number = GAME_CONFIG.MAX_LIVES;
  private livesText!: Phaser.GameObjects.Text;
  private waveInProgress: boolean = false;
  private currentWave: number = 0;
  private previewRangeCircle: Phaser.GameObjects.Graphics | null = null;

  // Level 5 smart enemy mode
  private pathfinding!: Pathfinding | null;
  private isSmartLevel: boolean = false;

  // 移动端组件
  private joystick: VirtualJoystick | null = null;
  private _mobileToolbar: MobileToolbar | null = null;
  private mobileTowerPanel: MobileTowerPanel | null = null;
  private isMobileDevice: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { startingLevel?: number }): void {
    // 获取起始关卡（从菜单跳转时指定）
    if (data?.startingLevel !== undefined) {
      this.currentLevel = data.startingLevel;
    }
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

    // Initialize Level 5 components
    this.cropManager = new CropManager(this);
    this.pathfinding = new Pathfinding();

    // 创建玩家直升机
    this.playerHelicopter = new PlayerHelicopter(this, 400, 300);

    // 检测是否为移动设备并创建移动端组件
    this.isMobileDevice = isMobile();
    if (this.isMobileDevice) {
      this.createMobileControls();
    }

    // 创建 UI
    this.createUI();

    // Disable context menu on game canvas
    this.input.mouse?.disableContextMenu();

    // Keyboard shortcuts for tower selection (1-6) - 必须在UI创建后初始化
    this.setupKeyboardShortcuts();

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

    // 鼠标移动监听 - 显示攻击范围预览
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    // 启动背景音乐
    this.audioSystem.startBGM();
  }

  /**
   * 创建移动端控制组件
   */
  private createMobileControls(): void {
    // 创建虚拟摇杆（左下角）
    this.joystick = new VirtualJoystick(this, 80, 480);

    // 创建快捷按钮栏（右下角）
    this.createMobileToolbar();

    // 移动端使用自定义塔楼选择面板（替换桌面端的底部面板）
    this.createMobileTowerPanel();
  }

  /**
   * 创建移动端塔楼选择面板
   * 替换桌面端的底部面板，提供更好的触摸体验
   */
  private createMobileTowerPanel(): void {
    // 创建移动端塔楼选择面板（屏幕底部）
    this.mobileTowerPanel = new MobileTowerPanel(this, 400, 540);
    this.mobileTowerPanel.setButtonClickCallback((key: string) => {
      this.selectTower(key);
    });
    this.add.existing(this.mobileTowerPanel);
  }

  /**
   * 创建移动端快捷按钮栏
   */
  private createMobileToolbar(): void {
    const toolbarConfig = [
      {
        key: 'cancel',
        label: '取消',
        emoji: '❌',
        color: 0xCC3333,
        onClick: () => {
          this.deselectTower();
          this.audioSystem.playClickSound();
        }
      },
      {
        key: 'range',
        label: '射程',
        emoji: '👁️',
        color: 0x3388CC,
        onClick: () => {
          this.playerHelicopter.toggleRange();
          this.audioSystem.playClickSound();
        }
      }
    ];

    this._mobileToolbar = new MobileToolbar(this, 680, 480, toolbarConfig);
    this.add.existing(this._mobileToolbar);
  }

  /**
   * 取消当前选中的塔
   */
  private deselectTower(): void {
    if (this.selectedTowerKey) {
      this.selectedTowerKey = null;
      this.clearPreviewRange();
      const currentSelectedBtn = (this as any).currentSelectedBtn;
      if (currentSelectedBtn) {
        currentSelectedBtn.setFillStyle(0x555555);
        (this as any).currentSelectedBtn = null;
      }
    }
    // 隐藏回收菜单
    this.hideTowerRecycleMenu();
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

    // 桌面端显示底部塔楼面板，移动端不显示（使用 MobileTowerPanel 替代）
    if (!this.isMobileDevice) {
      this.createDesktopTowerPanel();
    }
  }

  /**
   * 创建桌面端塔楼选择面板
   */
  private createDesktopTowerPanel(): void {
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

      // 快捷键提示
      this.add.text(x, y + 28, `${index + 1}`, {
        fontSize: '12px',
        color: '#AAAAAA'
      }).setOrigin(0.5);

      // 点击事件
      btn.on('pointerdown', () => {
        this.selectTower(key, btn);
      });

      // 保存按钮引用
      (this as any).towerButtons = (this as any).towerButtons || new Map();
      (this as any).towerButtons.set(key, btn);
    });

    // 初始没有选中任何按钮
    (this as any).currentSelectedBtn = null;
  }

  private selectedTowerKey: string | null = null;

  private selectTower(towerKey: string, btn?: Phaser.GameObjects.Rectangle): void {
    const towerButtons = (this as any).towerButtons;
    const currentSelectedBtn = (this as any).currentSelectedBtn;

    // Toggle: if clicking the same tower, deselect it
    if (this.selectedTowerKey === towerKey) {
      this.selectedTowerKey = null;
      this.audioSystem.playClickSound();
      console.log('Deselected tower');

      // 清除攻击范围预览
      this.clearPreviewRange();

      // 重置所有按钮颜色
      if (towerButtons) {
        towerButtons.forEach((b: Phaser.GameObjects.Rectangle) => {
          b.setFillStyle(0x555555);
        });
      }
      (this as any).currentSelectedBtn = null;
      return;
    }

    // 重置之前选中的按钮
    if (currentSelectedBtn) {
      currentSelectedBtn.setFillStyle(0x555555);
    }

    this.selectedTowerKey = towerKey;
    this.audioSystem.playClickSound();
    console.log('Selected tower:', towerKey);

    // Deselect all towers when selecting a new one
    for (const tower of this.towerManager.getTowers()) {
      tower.showSelected(false);
    }

    // 高亮当前选中的按钮
    if (btn) {
      btn.setFillStyle(0x00AA00); // 绿色表示选中
      (this as any).currentSelectedBtn = btn;
    } else if (towerButtons && towerButtons.has(towerKey)) {
      // 如果是通过键盘触发的，找到对应的按钮
      const targetBtn = towerButtons.get(towerKey);
      targetBtn.setFillStyle(0x00AA00);
      (this as any).currentSelectedBtn = targetBtn;
    }

    // 立即显示范围预览（如果鼠标已经在游戏区域）
    const pointer = this.input.activePointer;
    if (pointer.y <= 520) {
      this.updatePreviewRange(pointer.x, pointer.y);
    }

    // 同步移动端面板选中状态
    if (this.mobileTowerPanel) {
      this.mobileTowerPanel.selectTower(towerKey);
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
        // 清除攻击范围预览
        this.clearPreviewRange();
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

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    // 如果有选中的塔类型，显示攻击范围预览
    if (this.selectedTowerKey) {
      // 检查鼠标是否在游戏区域（不在塔选择面板区域）
      const isInTowerPanel = pointer.y > 520;

      if (!isInTowerPanel) {
        this.updatePreviewRange(pointer.x, pointer.y);
              } else {
        this.clearPreviewRange();
              }
    } else {
      this.clearPreviewRange();
          }
  }

  private updatePreviewRange(x: number, y: number): void {
    const towerConfig = TOWERS[this.selectedTowerKey!];
    if (!towerConfig) return;

    if (!this.previewRangeCircle) {
      this.previewRangeCircle = this.add.graphics();
    }

    this.previewRangeCircle.clear();

    // 绘制半透明填充
    this.previewRangeCircle.fillStyle(0x00ff00, 0.1);
    this.previewRangeCircle.fillCircle(x, y, towerConfig.range);

    // 绘制边线
    this.previewRangeCircle.lineStyle(2, 0x00ff00, 0.5);
    this.previewRangeCircle.strokeCircle(x, y, towerConfig.range);

    // 绘制中心点（表示塔的位置）
    this.previewRangeCircle.fillStyle(0x00ff00, 0.8);
    this.previewRangeCircle.fillCircle(x, y, 4);
  }

  private clearPreviewRange(): void {
    if (this.previewRangeCircle) {
      this.previewRangeCircle.clear();
    }
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    if (this.selectedTowerKey) {
      // Check if clicked on the tower selection panel at bottom
      const clickedTowerPanel = pointer.y > 520;

      if (clickedTowerPanel) {
        return; // Clicked on panel, do nothing
      }

      // Check if clicked on an existing tower
      const clickedExistingTower = this.towerManager.getTowers().some(
        tower => Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, tower.x, tower.y) < 30
      );

      if (clickedExistingTower) {
        return; // Clicked on existing tower (handled by Tower class)
      }

      // Place tower on empty space
      const tower = TOWERS[this.selectedTowerKey];
      if (this.economySystem.canAfford(tower.cost)) {
        if (this.economySystem.spendMoney(tower.cost)) {
          this.towerManager.placeTower(pointer.x, pointer.y, this.selectedTowerKey);
          // 放置成功后清除预览范围（如果保持选中状态）
          // 如果希望放置后保持选中并继续显示预览，可以注释掉下面这行
          // this.clearPreviewRange();
          // After placing, you can choose to keep selected or deselect
          // this.selectedTowerKey = null; // Uncomment to deselect after placing
        }
      } else {
        console.log('Not enough money!');
        // Deselect if can't afford
        this.selectedTowerKey = null;
        // 清除攻击范围预览
        this.clearPreviewRange();
        // Also reset button highlight
        const currentSelectedBtn = (this as any).currentSelectedBtn;
        if (currentSelectedBtn) {
          currentSelectedBtn.setFillStyle(0x555555);
          (this as any).currentSelectedBtn = null;
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

    // Check if this is Level 5 (smart enemy mode)
    this.isSmartLevel = level.isSmartLevel || false;

    if (this.currentWave >= level.waves.length) {
      // 当前关卡完成，进入下一关
      this.currentLevel++;
      this.currentWave = 0;
      // Clear crops and disable smart mode when changing levels
      if (this.cropManager) {
        this.cropManager.clear();
      }
      this.isSmartLevel = false;
      console.log(`Level ${this.currentLevel} complete!`);
      this.startNextWave();
      return;
    }

    this.waveInProgress = true;
    this.currentWave++;

    // Level 5: Place crops on first wave
    if (this.isSmartLevel && this.currentWave === 1 && this.cropManager) {
      this.cropManager.placeCropGrid(100, 100, 600, 400, 80, 'wheat');
    }

    // Enable smart enemy mode for Level 5
    if (this.isSmartLevel && this.pathfinding) {
      this.enemyManager.enableSmartMode(
        this.pathfinding,
        () => this.towerManager.getTowers().map(t => ({ x: t.x, y: t.y, radius: 40 })),
        () => this.cropManager.getCrops()
      );
    }

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
    // 处理虚拟摇杆输入（移动端）
    if (this.isMobileDevice && this.joystick) {
      const direction = this.joystick.getDirection();
      this.playerHelicopter.setJoystickInput(direction.x, direction.y);
    }

    // 更新敌人
    this.enemyManager.update(time, delta);

    // 更新塔楼并发射子弹
    const enemies = this.enemyManager.getEnemies();
    const newProjectiles = this.towerManager.update(time, delta, enemies as any[]);
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
