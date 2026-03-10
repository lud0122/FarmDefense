import Phaser from 'phaser';
import { TowerConfig } from '../config/towers';
import { Enemy } from './Enemy';

// 塔楼视觉效果配置 - 每个塔楼类型有不同的颜色和形状
const TOWER_STYLES: Record<string, {
  baseColor: number;
  accentColor: number;
  darkColor: number;
  name: string;
}> = {
  pistol: {
    baseColor: 0x8B4513, // 棕色木塔
    accentColor: 0xD2691E,
    darkColor: 0x5D4037,
    name: 'pistol'
  },
  machinegun: {
    baseColor: 0x455A64, // 深蓝灰金属
    accentColor: 0x607D8B,
    darkColor: 0x263238,
    name: 'machinegun'
  },
  grenade: {
    baseColor: 0x2E7D32, // 绿色军营
    accentColor: 0x4CAF50,
    darkColor: 0x1B5E20,
    name: 'grenade'
  },
  ice: {
    baseColor: 0x29B6F6, // 冰蓝
    accentColor: 0x81D4FA,
    darkColor: 0x0277BD,
    name: 'ice'
  },
  electric: {
    baseColor: 0xFFD700, // 金色
    accentColor: 0xFFEB3B,
    darkColor: 0xF57F17,
    name: 'electric'
  },
  sentinel: {
    baseColor: 0x9C27B0, // 紫色魔法
    accentColor: 0xCE93D8,
    darkColor: 0x6A1B9A,
    name: 'sentinel'
  }
};

export class Tower extends Phaser.GameObjects.Container {
  public config: TowerConfig;
  public lastFireTime: number = 0;
  public originalCost: number;
  private rangeCircle: Phaser.GameObjects.Graphics | null = null;
  private base: Phaser.GameObjects.Graphics;
  private turret: Phaser.GameObjects.Graphics;
  private barrel: Phaser.GameObjects.Graphics;
  private level: number = 1;
  private selectionIndicator: Phaser.GameObjects.Rectangle | null = null;
  private towerStyle: { baseColor: number; accentColor: number; darkColor: number; name: string };

  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y);
    this.config = config;
    this.originalCost = config.cost;
    this.towerStyle = TOWER_STYLES[config.key] || TOWER_STYLES.pistol;

    // 创建精美塔楼图形
    this.turret = scene.add.graphics();
    this.barrel = scene.add.graphics();
    this.base = scene.add.graphics();

    // 绘制塔楼
    this.drawTower();

    // 添加到容器
    this.add(this.base);
    this.add(this.turret);
    this.add(this.barrel);

    // 选中高亮效果（默认隐藏）
    this.selectionIndicator = scene.add.rectangle(0, 0, 44, 44, 0x00FF00, 0.2);
    this.selectionIndicator.setStrokeStyle(3, 0x00FF00);
    this.selectionIndicator.setVisible(false);
    this.add(this.selectionIndicator);

    // 创建隐形交互区域
    this.setSize(40, 40);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-20, -20, 40, 40),
      Phaser.Geom.Rectangle.Contains
    );
    this.setupInteraction();

    scene.add.existing(this);
    this.setDepth(10); // 塔楼固定深度
  }

  private drawTower(): void {
    const style = this.towerStyle;

    // 绘制基座（多层）
    this.base.clear();

    // 基座阴影
    this.base.fillStyle(0x000000, 0.3);
    this.base.fillEllipse(2, 22, 36, 16);

    // 基座底部
    this.base.fillStyle(style.darkColor);
    this.base.fillRoundedRect(-16, 8, 32, 16, 4);

    // 基座中部
    this.base.fillStyle(style.baseColor);
    this.base.fillRoundedRect(-14, 0, 28, 16, 4);

    // 绘制炮塔主体 (中间圆球)
    this.turret.clear();

    // 阴影
    this.turret.fillStyle(0x000000, 0.2);
    this.turret.fillCircle(2, 2, 12);

    // 主炮塔 - 根据类型绘制不同形状
    this.turret.fillStyle(style.baseColor);

    if (style.name === 'machinegun') {
      // 机枪塔 - 扁圆
      this.turret.fillEllipse(0, -2, 22, 16);
    } else if (style.name === 'electric') {
      // 电塔 - 六角形
      this.drawHexagon(this.turret, 0, -2, 12, style.accentColor);
    } else if (style.name === 'ice') {
      // 冰塔 - 尖顶
      this.turret.fillCircle(0, -2, 11);
      this.turret.fillTriangle(-6, -10, 6, -10, 0, -16);
    } else {
      // 标准圆形
      this.turret.fillCircle(0, -2, 12);
    }

    // 高光效果
    this.turret.fillStyle(0xFFFFFF, 0.3);
    this.turret.fillCircle(-4, -4, 4);

    // 绘制炮管
    this.drawBarrel();
  }

  private drawHexagon(gfx: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number): void {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push({
        x: x + Math.cos(angle) * r,
        y: y + Math.sin(angle) * r
      });
    }
    gfx.fillStyle(color);
    gfx.fillPoints(points, true, true);
  }

  private drawBarrel(): void {
    const style = this.towerStyle;

    this.barrel.clear();

    // 根据类型绘制不同炮管
    if (style.name === 'grenade') {
      // 榴弹炮 - 短粗
      this.barrel.fillStyle(style.darkColor);
      this.barrel.fillRoundedRect(-5, -22, 10, 18, 3);
      this.barrel.fillStyle(style.accentColor);
      this.barrel.fillCircle(0, -22, 5);
    } else if (style.name === 'machinegun') {
      // 机枪 - 细长双管
      this.barrel.fillStyle(style.darkColor);
      this.barrel.fillRect(-5, -28, 3, 22);
      this.barrel.fillRect(2, -28, 3, 22);
      // 枪口
      this.barrel.fillStyle(style.accentColor);
      this.barrel.fillRect(-6, -32, 5, 4);
      this.barrel.fillRect(1, -32, 5, 4);
    } else if (style.name === 'ice') {
      // 冰冻塔 - 不需要炮管，有能量核心
      this.barrel.fillStyle(0x81D4FA, 0.8);
      this.barrel.fillCircle(0, -8, 6);
      this.barrel.fillStyle(0xE1F5FE, 0.6);
      this.barrel.fillCircle(0, -8, 3);
    } else if (style.name === 'electric') {
      // 电塔 - 闪电形状
      this.barrel.lineStyle(3, 0xFFEB3B);
      this.barrel.beginPath();
      this.barrel.moveTo(-3, -8);
      this.barrel.lineTo(0, -18);
      this.barrel.lineTo(3, -8);
      this.barrel.strokePath();
    } else if (style.name === 'sentinel') {
      // 哨兵 - 裂隙
      this.barrel.fillStyle(style.accentColor, 0.7);
      this.barrel.fillEllipse(0, -10, 4, 8);
    } else {
      // 标准炮管
      this.barrel.fillStyle(style.darkColor);
      this.barrel.fillRoundedRect(-4, -22, 8, 18, 2);
      // 炮口
      this.barrel.fillStyle(style.accentColor);
      this.barrel.fillCircle(0, -22, 4);
    }
  }

  private setupInteraction(): void {
    // 鼠标悬停效果
    this.on('pointerover', () => {
      this.showRange(true);
    });

    this.on('pointerout', () => {
      this.showRange(false);
    });

    // 点击事件（左键选择，右键回收）
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2) { // 右键
        this.onRightClick();
      } else if (pointer.button === 0) { // 左键
        this.onLeftClick();
      }
    });
  }

  private onRightClick(): void {
    // Show selection effect
    this.showSelected(true);

    // Call GameScene's showTowerRecycleMenu method directly
    const gameScene = this.scene as any;
    if (gameScene.showTowerRecycleMenu) {
      gameScene.showTowerRecycleMenu(this);
    }
  }

  private onLeftClick(): void {
    // 左键点击已存在的塔楼时，应该选中它并显示回收菜单
    // 这样玩家可以通过点击塔楼来查看回收价值
    const gameScene = this.scene as any;
    if (gameScene.showTowerRecycleMenu) {
      gameScene.showTowerRecycleMenu(this);
    }
  }

  public showSelected(selected: boolean): void {
    if (this.selectionIndicator) {
      this.selectionIndicator.setVisible(selected);
    }
  }

  public getRecycleValue(): number {
    return Math.floor(this.originalCost * 0.5);
  }

  public update(time: number, _delta: number, enemies: Enemy[]): Phaser.GameObjects.GameObject | null {
    if (time < this.lastFireTime + this.config.fireRate) return null;

    const target = this.findTarget(enemies);
    if (target) {
      // 计算指向目标的角度
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

      // 对于需要旋转炮管的塔（非冰塔、电塔）
      if (this.towerStyle.name !== 'ice' && this.towerStyle.name !== 'electric') {
        // 重新绘制旋转后的炮管
        this.barrel.clear();
        this.barrel.setRotation(angle - Math.PI / 2);
        this.drawBarrel();
        this.barrel.setRotation(0);
      }

      this.lastFireTime = time;
      return this.fire(target);
    }

    return null;
  }

  protected findTarget(enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, enemy.x, enemy.y
      );
      if (distance <= this.config.range && distance < closestDistance) {
        closestDistance = distance;
        closest = enemy;
      }
    }

    return closest;
  }

  protected fire(_target: Enemy): Phaser.GameObjects.GameObject {
    // 子类实现，基类返回一个临时子弹
    const bullet = this.scene.add.circle(this.x, this.y, 4, 0xFFFF00);
    return bullet;
  }

  public showRange(show: boolean): void {
    if (show) {
      if (!this.rangeCircle) {
        this.rangeCircle = this.scene.add.graphics();
        this.rangeCircle.lineStyle(2, 0x00ff00, 0.5);
        this.rangeCircle.strokeCircle(this.x, this.y, this.config.range);
      } else {
        this.rangeCircle.visible = true;
      }
    } else {
      if (this.rangeCircle) {
        this.rangeCircle.visible = false;
      }
    }
  }

  public upgrade(): void {
    if (this.level >= 3) return;

    this.level++;
    this.config.damage = Math.floor(this.config.damage * 1.2);
    this.config.range = Math.floor(this.config.range * 1.15);
    this.config.fireRate = Math.floor(this.config.fireRate * 0.9);

    // 升级视觉效果
    this.scene.tweens.add({
      targets: this.base,
      scale: 1.2,
      duration: 200,
      yoyo: true
    });
  }

  public getLevel(): number {
    return this.level;
  }

  public destroy(fromScene?: boolean): void {
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
    }
    super.destroy(fromScene);
  }
}
