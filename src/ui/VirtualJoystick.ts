import Phaser from 'phaser';

/**
 * 虚拟摇杆组件
 * 用于移动端触摸控制
 */
export class VirtualJoystick extends Phaser.GameObjects.Container {
  private base: Phaser.GameObjects.Container;
  private stick: Phaser.GameObjects.Container;
  private stickBase: Phaser.GameObjects.Graphics;
  private stickKnob: Phaser.GameObjects.Graphics;

  private pointerId: number | null = null;
  private isDragging: boolean = false;

  private direction: { x: number; y: number } = { x: 0, y: 0 };
  private joystickAngle: number = 0;
  private distance: number = 0;

  // 配置参数
  private readonly baseRadius: number = 60;
  private readonly knobRadius: number = 30;
  private readonly maxDistance: number = 40;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 创建底座容器
    this.base = scene.add.container(x, y);

    // 底座背景（半透明圆形）
    const baseGraphics = scene.add.graphics();
    baseGraphics.fillStyle(0x333333, 0.4);
    baseGraphics.fillCircle(0, 0, this.baseRadius);
    baseGraphics.lineStyle(2, 0x666666, 0.6);
    baseGraphics.strokeCircle(0, 0, this.baseRadius);
    this.base.add(baseGraphics);

    // 方向指示器
    this.stickBase = scene.add.graphics();
    this.base.add(this.stickBase);

    // 创建摇杆 knob
    this.stick = scene.add.container(x, y);
    this.stickKnob = scene.add.graphics();
    this.stickKnob.fillStyle(0x999999, 0.8);
    this.stickKnob.fillCircle(0, 0, this.knobRadius);
    this.stickKnob.lineStyle(2, 0xFFFFFF, 0.5);
    this.stickKnob.strokeCircle(0, 0, this.knobRadius);
    this.stick.add(this.stickKnob);

    // 添加中心点
    const centerDot = scene.add.graphics();
    centerDot.fillStyle(0xFFFFFF, 0.3);
    centerDot.fillCircle(0, 0, 8);
    this.stick.add(centerDot);

    this.base.setDepth(1000);
    this.stick.setDepth(1001);

    // 设置交互
    this.setupInteraction();
  }

  private setupInteraction(): void {
    // 摇杆跟随触摸
    this.stick.setInteractive(new Phaser.Geom.Circle(0, 0, this.maxDistance), Phaser.Geom.Circle.Contains);

    this.stick.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.pointerId = pointer.id;
    });

    this.stick.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.pointerId === pointer.id) {
        this.updateStickPosition(pointer.x, pointer.y);
      }
    });

    this.stick.on('pointerup', () => this.resetStick());
    this.stick.on('pointerout', () => this.resetStick());

    // 全局指针事件处理
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.pointerId === pointer.id) {
        this.updateStickPosition(pointer.x, pointer.y);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.pointerId === pointer.id) {
        this.resetStick();
      }
    });
  }

  private updateStickPosition(pointerX: number, pointerY: number): void {
    if (!this.isDragging) return;

    // 计算相对于底座中心的偏移
    const dx = pointerX - this.x;
    const dy = pointerY - this.y;

    // 计算距离和角度
    this.distance = Math.sqrt(dx * dx + dy * dy);
    this.joystickAngle = Phaser.Math.Angle.Between(0, 0, dx, dy);

    // 限制最大距离
    const clampedDistance = Math.min(this.distance, this.maxDistance);

    // 更新摇杆位置
    const stickX = Math.cos(this.joystickAngle) * clampedDistance;
    const stickY = Math.sin(this.joystickAngle) * clampedDistance;

    this.stick.setPosition(this.x + stickX, this.y + stickY);

    // 更新方向指示器
    this.updateDirectionIndicator(stickX, stickY);
  }

  private updateDirectionIndicator(stickX: number, stickY: number): void {
    // 归一化方向值 (-1 到 1)
    this.direction.x = stickX / this.maxDistance;
    this.direction.y = stickY / this.maxDistance;

    // 绘制方向指示线
    this.stickBase.clear();
    this.stickBase.lineStyle(2, 0xFFFFFF, 0.5);
    this.stickBase.moveTo(0, 0);
    this.stickBase.lineTo(stickX, stickY);
    this.stickBase.strokePath();
  }

  private resetStick(): void {
    this.isDragging = false;
    this.pointerId = null;
    this.direction = { x: 0, y: 0 };

    // 重置摇杆位置
    this.stick.setPosition(this.x, this.y);

    // 清除指示器
    this.stickBase.clear();
  }

  /**
   * 获取当前方向向量
   * @returns { x: number, y: number } - 方向向量，值范围 -1 到 1
   */
  public getDirection(): { x: number; y: number } {
    return this.direction;
  }

  /**
   * 获取当前角度（弧度）
   * @returns number - 角度（弧度）
   */
  public getAngle(): number {
    return this.angle;
  }

  /**
   * 是否正在被拖动
   * @returns boolean
   */
  public isBeingDragged(): boolean {
    return this.isDragging;
  }

  /**
   * 获取摇杆位置
   * @returns { x: number, y: number }
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public destroy(fromScene?: boolean): void {
    this.base.destroy(true);
    this.stick.destroy(true);
    this.stickBase.destroy();
    this.stickKnob.destroy();
    super.destroy(fromScene);
  }
}
