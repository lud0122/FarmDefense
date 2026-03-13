import Phaser from 'phaser';
import { Projectile } from './Projectile';

// Enemy-like interface for targeting (works with Enemy and SmartEnemy)
interface Targetable {
  x: number;
  y: number;
  active: boolean;
  getPosition(): { x: number; y: number };
}

export class PlayerHelicopter extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Text;
  private rotor!: Phaser.GameObjects.Text;
  private rangeCircle: Phaser.GameObjects.Graphics | null = null;
  private lastFireTime: number = 0;
  private fireRate: number = 300; // 射击间隔 300ms
  private bulletDamage: number = 15;
  private bulletSpeed: number = 500;
  private moveSpeed: number = 200;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};

  // 移动端触摸控制相关
  private joystickInputs: { dx: number; dy: number } | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 直升机主体（使用emoji）
    this.sprite = scene.add.text(0, 0, '🚁', {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.add(this.sprite);

    // 旋转螺旋桨效果
    this.rotor = scene.add.text(0, -15, '🌀', {
      fontSize: '20px'
    }).setOrigin(0.5);
    this.add(this.rotor);

    // 创建旋转动画
    this.scene.tweens.add({
      targets: this.rotor,
      rotation: Math.PI * 2,
      duration: 100,
      repeat: -1,
      ease: 'Linear'
    });

    // 设置键盘控制
    this.setupControls();

    // 设置拖动效果
    this.setSize(48, 48);

    scene.add.existing(this);
    this.setDepth(100); // 飞机在最上层

    // 显示射程范围（按R键切换）
    this.createRangeIndicator();
  }

  private setupControls(): void {
    if (!this.scene) return;

    // WASD控制
    this.keys['W'] = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys['A'] = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keys['S'] = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys['D'] = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // R键切换射程显示
    this.keys['R'] = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keys['R'].on('down', () => {
      this.toggleRangeIndicator();
    });

    // 空格键手动射击（可选）
    this.keys['SPACE'] = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private createRangeIndicator(): void {
    this.rangeCircle = this.scene.add.graphics();
    this.rangeCircle.lineStyle(2, 0x00FF00, 0.3);
    this.rangeCircle.strokeCircle(this.x, this.y, 200);
    this.rangeCircle.setVisible(false);
  }

  private toggleRangeIndicator(): void {
    if (this.rangeCircle) {
      this.rangeCircle.setVisible(!this.rangeCircle.visible);
    }
  }

  public update(time: number, delta: number, enemies: Targetable[]): Phaser.GameObjects.GameObject | null {
    this.handleMovement(delta);
    this.updateRangeIndicator();

    // 自动瞄准射击
    if (time > this.lastFireTime + this.fireRate) {
      const projectile = this.handleAutoAimShoot(time, enemies);
      if (projectile) {
        return projectile;
      }
    }

    return null;
  }

  private handleMovement(delta: number): void {
    let dx = 0;
    let dy = 0;

    // 桌面端：检测键盘按键
    if (this.keys['W']?.isDown) dy -= 1;
    if (this.keys['S']?.isDown) dy += 1;
    if (this.keys['A']?.isDown) dx -= 1;
    if (this.keys['D']?.isDown) dx += 1;

    // 移动端：应用虚拟摇杆输入（优先于键盘）
    if (this.joystickInputs) {
      dx = this.joystickInputs.dx;
      dy = this.joystickInputs.dy;

      // 归一化对角移动
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      // 应用移动
      this.x += dx * this.moveSpeed * (delta / 1000);
      this.y += dy * this.moveSpeed * (delta / 1000);

      // 边界限制
      this.x = Phaser.Math.Clamp(this.x, 30, 770);
      this.y = Phaser.Math.Clamp(this.y, 50, 500);

      // 根据移动方向倾斜直升机
      if (dx > 0) {
        this.sprite.setRotation(0.1);
      } else if (dx < 0) {
        this.sprite.setRotation(-0.1);
      } else {
        this.sprite.setRotation(0);
      }
    }

    // 桌面端移动
    if (dx !== 0 || dy !== 0) {
      // 归一化
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0) {
        dx /= length;
        dy /= length;
      }

      // 应用移动
      this.x += dx * this.moveSpeed * (delta / 1000);
      this.y += dy * this.moveSpeed * (delta / 1000);

      // 边界限制
      this.x = Phaser.Math.Clamp(this.x, 30, 770);
      this.y = Phaser.Math.Clamp(this.y, 50, 500);

      // 根据移动方向倾斜直升机
      if (dx > 0) {
        this.sprite.setRotation(0.1);
      } else if (dx < 0) {
        this.sprite.setRotation(-0.1);
      } else {
        this.sprite.setRotation(0);
      }
    }
  }

  private updateRangeIndicator(): void {
    if (this.rangeCircle && this.rangeCircle.visible) {
      this.rangeCircle.clear();
      this.rangeCircle.lineStyle(2, 0x00FF00, 0.3);
      this.rangeCircle.strokeCircle(this.x, this.y, 200);
    }
  }

  private handleAutoAimShoot(time: number, enemies: Targetable[]): Phaser.GameObjects.GameObject | null {
    // 查找范围内的敌人
    const target = this.findTarget(enemies);
    if (target) {
      // 旋转直升机指向目标（限制旋转角度避免翻转）
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      // 限制旋转范围：只允许小幅旋转（-60°到+60°），保持飞机大致朝上
      const limitedAngle = Phaser.Math.Clamp(angle, -Math.PI / 3, Math.PI / 3);
      this.sprite.setRotation(limitedAngle);

      // 发射子弹
      this.lastFireTime = time;
      return this.fire(target);
    }
    return null;
  }

  private findTarget(enemies: Targetable[]): Targetable | null {
    const range = 200; // 射程 200
    let closest: Targetable | null = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.active) continue;

      const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (distance <= range && distance < closestDistance) {
        closestDistance = distance;
        closest = enemy;
      }
    }

    return closest;
  }

  private fire(target: Targetable): Projectile {
    // 播放射击音效
    const gameScene = this.scene as any;
    if (gameScene.audioSystem) {
      gameScene.audioSystem.playShootSound();
    }

    // 创建子弹
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      target as any,
      this.bulletSpeed,
      this.bulletDamage,
      0x00FF00 // 绿色子弹
    );

    // 后坐力效果
    this.scene.tweens.add({
      targets: this,
      x: this.x - (target.x - this.x) * 0.02,
      y: this.y - (target.y - this.y) * 0.02,
      duration: 50,
      yoyo: true
    });

    return projectile;
  }

  /**
   * 设置虚拟摇杆输入
   * 用于移动端触摸控制
   */
  public setJoystickInput(dx: number, dy: number): void {
    this.joystickInputs = { dx, dy };
  }

  /**
   * 清除虚拟摇杆输入
   */
  public clearJoystickInput(): void {
    this.joystickInputs = null;
  }

  /**
   * 切换射程指示器显示
   * 用于移动端按钮调用
   */
  public toggleRange(): void {
    this.toggleRangeIndicator();
  }

  /**
   * 获取射程指示器状态
   */
  public isRangeVisible(): boolean {
    return this.rangeCircle ? this.rangeCircle.visible : false;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public destroy(fromScene?: boolean): void {
    // 清理键盘事件
    for (const key in this.keys) {
      this.keys[key].destroy();
    }

    if (this.rangeCircle) {
      this.rangeCircle.destroy();
    }

    super.destroy(fromScene);
  }
}
