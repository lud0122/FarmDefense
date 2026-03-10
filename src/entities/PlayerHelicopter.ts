import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';

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

  public update(time: number, delta: number, enemies: Enemy[]): Phaser.GameObjects.GameObject | null {
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

    // 检测按键并计算移动方向
    if (this.keys['W'].isDown) dy -= 1;
    if (this.keys['S'].isDown) dy += 1;
    if (this.keys['A'].isDown) dx -= 1;
    if (this.keys['D'].isDown) dx += 1;

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

  private updateRangeIndicator(): void {
    if (this.rangeCircle && this.rangeCircle.visible) {
      this.rangeCircle.clear();
      this.rangeCircle.lineStyle(2, 0x00FF00, 0.3);
      this.rangeCircle.strokeCircle(this.x, this.y, 200);
    }
  }

  private handleAutoAimShoot(time: number, enemies: Enemy[]): Phaser.GameObjects.GameObject | null {
    // 查找范围内的敌人
    const target = this.findTarget(enemies);
    if (target) {
      // 旋转直升机指向目标
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      this.sprite.setRotation(angle);

      // 发射子弹
      this.lastFireTime = time;
      return this.fire(target);
    }
    return null;
  }

  private findTarget(enemies: Enemy[]): Enemy | null {
    const range = 200; // 射程 200
    let closest: Enemy | null = null;
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

  private fire(target: Enemy): Projectile {
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
      target,
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
