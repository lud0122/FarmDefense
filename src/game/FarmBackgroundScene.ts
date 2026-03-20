import Phaser from 'phaser';

/**
 * FarmBackgroundScene - 富有生活气息的农场背景场景
 *
 * 设计理念：有机农场未来主义 + 温馨田园风格
 *
 * 元素包括：
 * - 栅栏围起的农场边界
 * - 鸡、鸭、鹅等家禽（带动画）
 * - 小桥流水
 * - 各种作物（麦田、玉米、向日葵等）
 * - 装饰性元素（风车、干草堆、谷仓等）
 */
export class FarmBackgroundScene extends Phaser.Scene {
  private chickens: Phaser.GameObjects.Sprite[] = [];
  private ducks: Phaser.GameObjects.Sprite[] = [];
  private geese: Phaser.GameObjects.Sprite[] = [];
  private waterRipples: Phaser.GameObjects.Graphics[] = [];
  private animationTime = 0;

  constructor() {
    super({ key: 'FarmBackgroundScene' });
  }

  create(): void {
    this.createSkyAndLandscape();
    this.createFence();
    this.createPond();
    this.createBridge();
    this.createCrops();
    this.createFarmAnimals();
    this.createDecorations();
    this.createAnimatedElements();

    // 启动动画循环
    this.animationTime = 0;
  }

  update(_time: number, delta: number): void {
    this.animationTime += delta;
    this.animateWaterRipples();
    this.animateFarmAnimals();
  }

  /**
   * 天空和地貌
   */
  private createSkyAndLandscape(): void {
    const graphics = this.add.graphics();

    // 渐变天空 - 温暖的午后色调
    for (let y = 0; y < 300; y++) {
      const ratio = y / 300;
      const r = Math.floor(135 + ratio * 20);
      const g = Math.floor(206 + ratio * 10);
      const b = Math.floor(235 - ratio * 20);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      graphics.fillRect(0, y, 800, 1);
    }

    // 远山轮廓 - 淡紫色朦胧感
    graphics.fillStyle(0xC5A3C3, 0.4);
    graphics.beginPath();
    graphics.moveTo(0, 280);
    graphics.lineTo(100, 250);
    graphics.lineTo(200, 270);
    graphics.lineTo(300, 240);
    graphics.lineTo(400, 260);
    graphics.lineTo(500, 230);
    graphics.lineTo(600, 250);
    graphics.lineTo(700, 220);
    graphics.lineTo(800, 240);
    graphics.lineTo(800, 350);
    graphics.lineTo(0, 350);
    graphics.closePath();
    graphics.fillPath();

    // 草地底层 - 温暖的绿色
    graphics.fillStyle(0x7CB342);
    graphics.fillRect(0, 350, 800, 250);

    // 草地纹理 - 多层次绿色斑块
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(350, 600);
      const size = Phaser.Math.Between(8, 25);
      const green = Phaser.Math.RND.pick([0x8BC34A, 0x9CCC65, 0x7CB342, 0x689F38]);
      graphics.fillStyle(green, 0.6);
      graphics.fillCircle(x, y, size);
    }

    // 土地肌理 - 深色土地斑块
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(380, 600);
      const w = Phaser.Math.Between(20, 50);
      const h = Phaser.Math.Between(10, 20);
      graphics.fillStyle(0x5D4037, 0.3);
      graphics.fillEllipse(x, y, w, h);
    }
  }

  /**
   * 栅栏围栏
   */
  private createFence(): void {
    const graphics = this.add.graphics();

    // 围栏参数
    const fenceX = 50;
    const fenceY = 380;
    const fenceWidth = 700;
    const fenceHeight = 200;

    // 左侧围栏
    this.drawFenceSide(graphics, fenceX, fenceY, fenceX, fenceY + fenceHeight);
    // 右侧围栏
    this.drawFenceSide(graphics, fenceX + fenceWidth, fenceY, fenceX + fenceWidth, fenceY + fenceHeight);
    // 底部围栏
    this.drawFenceBottom(graphics, fenceX, fenceY + fenceHeight, fenceWidth);

    // 围栏门 - 装饰性入口
    const gateX = fenceX + fenceWidth / 2;
    const gateY = fenceY + fenceHeight;

    // 门框
    graphics.lineStyle(4, 0x8D6E63);
    graphics.strokeRect(gateX - 30, gateY - 60, 60, 60);

    // 门板
    graphics.fillStyle(0xA1887F);
    graphics.fillRect(gateX - 28, gateY - 58, 56, 56);

    // 门把手
    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(gateX + 15, gateY - 30, 4);
  }

  private drawFenceSide(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, _x2: number, y2: number): void {
    const postSpacing = 35;

    // 绘制木桩
    for (let y = y1; y < y2; y += postSpacing) {
      graphics.fillStyle(0x8D6E63);
      graphics.fillRect(x1 - 3, y, 6, postSpacing - 5);

      // 木纹细节
      graphics.lineStyle(1, 0x6D4C41, 0.5);
      graphics.lineBetween(x1 - 2, y + 5, x1 + 2, y + 10);
      graphics.lineBetween(x1 - 2, y + 15, x1 + 2, y + 20);
    }

    // 横杆
    graphics.fillStyle(0xA1887F);
    graphics.fillRect(x1 - 5, y1 + 20, 10, 4);
    graphics.fillRect(x1 - 5, y1 + 60, 10, 4);
  }

  private drawFenceBottom(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number): void {
    // 底部围栏横杆
    graphics.fillStyle(0xA1887F);
    graphics.fillRect(x, y + 20, width, 6);
    graphics.fillRect(x, y + 50, width, 6);

    // 木桩
    for (let i = 0; i < width; i += 40) {
      graphics.fillStyle(0x8D6E63);
      graphics.fillRect(x + i, y, 5, 70);

      // 木纹
      graphics.lineStyle(1, 0x6D4C41, 0.5);
      graphics.lineBetween(x + i + 1, y + 10, x + i + 4, y + 15);
      graphics.lineBetween(x + i + 1, y + 30, x + i + 4, y + 35);
    }
  }

  /**
   * 池塘 - 带波纹动画
   */
  private createPond(): void {
    const graphics = this.add.graphics();

    // 池塘位置
    const pondX = 150;
    const pondY = 480;

    // 池塘底部 - 深蓝绿色（使用椭圆形状）
    graphics.fillStyle(0x1565C0, 0.6);
    graphics.fillEllipse(pondX, pondY, 100, 50);

    // 池塘水面 - 浅蓝绿色渐变
    graphics.fillStyle(0x42A5F5, 0.4);
    graphics.fillEllipse(pondX, pondY, 95, 45);

    // 池塘边缘 - 泥土和石头
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const rx = 100 + Phaser.Math.Between(-5, 5);
      const ry = 50 + Phaser.Math.Between(-5, 5);
      const x = pondX + Math.cos(angle) * rx;
      const y = pondY + Math.sin(angle) * ry;
      const size = Phaser.Math.Between(8, 15);

      graphics.fillStyle(Phaser.Math.RND.pick([0x795548, 0x6D4C41, 0x8D6E63]));
      graphics.fillCircle(x, y, size);
    }

    // 水草（使用直线和弧线）
    for (let i = 0; i < 8; i++) {
      const angle = Phaser.Math.Between(0.2, 0.8) * Math.PI;
      const x = pondX + Math.cos(angle) * 60;
      const y = pondY + Math.sin(angle) * 30;

      graphics.lineStyle(3, 0x558B2F, 0.8);
      graphics.beginPath();
      graphics.moveTo(x, y);
      graphics.lineTo(x + Phaser.Math.Between(-20, 20), y - Phaser.Math.Between(20, 40));
      graphics.strokePath();
    }

    // 创建波纹动画对象
    for (let i = 0; i < 3; i++) {
      const ripple = this.add.graphics();
      ripple.setVisible(false);
      this.waterRipples.push(ripple);
    }
  }

  /**
   * 小桥
   */
  private createBridge(): void {
    const graphics = this.add.graphics();

    // 桥的位置 - 跨越池塘
    const bridgeX = 130;
    const bridgeY = 450;

    // 桥面 - 木质
    graphics.fillStyle(0x8D6E63);
    graphics.fillRect(bridgeX, bridgeY - 10, 50, 20);

    // 桥板纹理
    graphics.lineStyle(1, 0x6D4C41);
    for (let i = 0; i < 50; i += 8) {
      graphics.lineBetween(bridgeX + i, bridgeY - 10, bridgeX + i, bridgeY + 10);
    }

    // 桥栏杆
    graphics.fillStyle(0xA1887F);
    graphics.fillRect(bridgeX - 3, bridgeY - 25, 3, 25);
    graphics.fillRect(bridgeX + 50, bridgeY - 25, 3, 25);

    // 横杆
    graphics.fillRect(bridgeX - 3, bridgeY - 25, 56, 3);

    // 桥墩
    graphics.fillStyle(0x795548);
    graphics.fillRect(bridgeX + 5, bridgeY + 10, 8, 20);
    graphics.fillRect(bridgeX + 37, bridgeY + 10, 8, 20);
  }

  /**
   * 作物 - 麦田、玉米、向日葵等
   */
  private createCrops(): void {
    const graphics = this.add.graphics();

    // 麦田区域 - 左侧
    this.drawWheatField(graphics, 80, 420, 120, 60);

    // 玉米地 - 右上
    this.drawCornField(graphics, 550, 400, 100, 50);

    // 向日葵花圃 - 中心位置
    this.drawSunflowers(graphics, 350, 450);

    // 蔬菜园 - 小块土地
    this.drawVegetableGarden(graphics, 450, 520, 80, 40);
  }

  private drawWheatField(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    // 麦田背景
    graphics.fillStyle(0xF4E4C1, 0.6);
    graphics.fillRect(x, y, width, height);

    // 麦穗 - 密集的小麦
    for (let i = 0; i < width; i += 6) {
      for (let j = 0; j < height; j += 8) {
        const wheatX = x + i + Phaser.Math.Between(-2, 2);
        const wheatY = y + j + Phaser.Math.Between(-2, 2);

        // 麦秆
        graphics.lineStyle(2, 0xD4A574);
        graphics.lineBetween(wheatX, wheatY + 15, wheatX, wheatY);

        // 麦穗
        graphics.fillStyle(0xFFD54F);
        graphics.fillEllipse(wheatX, wheatY - 3, 4, 8);
      }
    }

    // 土地边框
    graphics.lineStyle(2, 0x795548, 0.5);
    graphics.strokeRect(x, y, width, height);
  }

  private drawCornField(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    // 玉米地背景
    graphics.fillStyle(0x7CB342, 0.4);
    graphics.fillRect(x, y, width, height);

    // 玉米植株
    for (let i = 0; i < 5; i++) {
      const cornX = x + 20 + i * 18;
      const cornY = y + height - 10;

      // 玉米秆
      graphics.lineStyle(4, 0x558B2F);
      graphics.lineBetween(cornX, cornY, cornX, cornY - 40);

      // 玉米叶子（使用简化形状）
      graphics.lineStyle(3, 0x7CB342);
      graphics.lineBetween(cornX, cornY - 20, cornX + 20, cornY - 15);
      graphics.lineBetween(cornX, cornY - 30, cornX - 20, cornY - 25);

      // 玉米棒
      graphics.fillStyle(0xFFC107);
      graphics.fillEllipse(cornX + 5, cornY - 25, 8, 15);
    }

    // 土地边框
    graphics.lineStyle(2, 0x795548, 0.5);
    graphics.strokeRect(x, y, width, height);
  }

  private drawSunflowers(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 向日葵 - 3-4株
    const positions = [
      { x: x - 30, y: y },
      { x: x, y: y - 15 },
      { x: x + 30, y: y + 5 }
    ];

    positions.forEach((pos) => {
      // 茎
      graphics.lineStyle(5, 0x558B2F);
      graphics.lineBetween(pos.x, pos.y + 40, pos.x, pos.y);

      // 叶子（使用填充椭圆）
      graphics.fillStyle(0x7CB342);
      graphics.fillEllipse(pos.x - 20, pos.y + 20, 15, 8);
      graphics.fillEllipse(pos.x + 20, pos.y + 25, 15, 8);

      // 花盘 - 棕色中心
      graphics.fillStyle(0x5D4037);
      graphics.fillCircle(pos.x, pos.y, 12);

      // 花瓣 - 金黄色
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const petalX = pos.x + Math.cos(angle) * 20;
        const petalY = pos.y + Math.sin(angle) * 20;

        graphics.fillStyle(0xFFD700);
        graphics.fillEllipse(petalX, petalY, 8, 15);
      }

      // 花盘细节
      graphics.fillStyle(0x3E2723);
      graphics.fillCircle(pos.x, pos.y, 8);
    });
  }

  private drawVegetableGarden(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    // 菜地背景 - 深色土壤
    graphics.fillStyle(0x5D4037, 0.8);
    graphics.fillRect(x, y, width, height);

    // 菜垄 - 平行线条
    graphics.lineStyle(2, 0x795548);
    for (let i = 0; i < width; i += 15) {
      graphics.lineBetween(x + i, y, x + i, y + height);
    }

    // 小蔬菜 - 简化的圆形表示
    const veggies = [
      { x: x + 10, y: y + 10, color: 0x66BB6A },  // 卷心菜
      { x: x + 40, y: y + 15, color: 0xFFA726 },  // 胡萝卜
      { x: x + 25, y: y + 30, color: 0xEF5350 },  // 番茄
      { x: x + 60, y: y + 25, color: 0x66BB6A }   // 生菜
    ];

    veggies.forEach((veg) => {
      graphics.fillStyle(veg.color);
      graphics.fillCircle(veg.x, veg.y, 6);
      graphics.fillStyle(0x43A047, 0.8);
      graphics.fillCircle(veg.x, veg.y - 3, 4);
    });

    // 边框
    graphics.lineStyle(2, 0x6D4C41);
    graphics.strokeRect(x, y, width, height);
  }

  /**
   * 家禽 - 鸡、鸭、鹅
   */
  private createFarmAnimals(): void {
    // 鸡 - 3只，在左侧区域活动
    this.createChicken(100, 400);
    this.createChicken(150, 430);
    this.createChicken(120, 460);

    // 鸭 - 2只，在池塘边
    this.createDuck(180, 470);
    this.createDuck(200, 485);

    // 鹅 - 2只，在草地散步
    this.createGoose(600, 450);
    this.createGoose(650, 480);
  }

  private createChicken(x: number, y: number): void {
    // 鸡的身体 - 简化的椭圆形状
    const chicken = this.add.graphics();

    // 身体 - 棕色/白色随机
    const bodyColor = Phaser.Math.RND.pick([0xD4A574, 0xF5F5F5, 0xFFAB91]);
    chicken.fillStyle(bodyColor);
    chicken.fillEllipse(0, 0, 18, 14);

    // 头部
    chicken.fillStyle(bodyColor);
    chicken.fillCircle(0, -12, 8);

    // 鸡冠 - 红色
    chicken.fillStyle(0xE53935);
    chicken.fillEllipse(0, -20, 6, 8);

    // 嘴巴
    chicken.fillStyle(0xFFA726);
    chicken.fillTriangle(-3, -12, 3, -12, 0, -8);

    // 眼睛
    chicken.fillStyle(0x000000);
    chicken.fillCircle(-3, -13, 2);

    // 翅膀
    chicken.fillStyle(Phaser.Display.Color.ValueToColor(bodyColor).darken(20).color);
    chicken.fillEllipse(-10, 0, 10, 8);

    // 腿
    chicken.lineStyle(2, 0xFFA726);
    chicken.lineBetween(-5, 7, -8, 15);
    chicken.lineBetween(5, 7, 8, 15);

    chicken.setPosition(x, y);
    this.chickens.push(chicken as any);
  }

  private createDuck(x: number, y: number): void {
    const duck = this.add.graphics();

    // 身体 - 白色
    duck.fillStyle(0xFFFFFF);
    duck.fillEllipse(0, 0, 22, 16);

    // 头部 - 绿色（公鸭）或 棕色（母鸭）
    const headColor = Phaser.Math.RND.pick([0x2E7D32, 0x8D6E63]);
    duck.fillStyle(headColor);
    duck.fillCircle(0, -14, 9);

    // 嘴巴 - 黄色扁嘴
    duck.fillStyle(0xFFC107);
    duck.fillEllipse(0, -12, 14, 4);

    // 眼睛
    duck.fillStyle(0x000000);
    duck.fillCircle(-3, -15, 2);

    // 翅膀
    duck.fillStyle(0xF5F5F5);
    duck.fillEllipse(-12, 0, 12, 10);

    // 尾巴
    duck.fillStyle(0xE0E0E0);
    duck.fillTriangle(10, -5, 18, -8, 15, 2);

    duck.setPosition(x, y);
    this.ducks.push(duck as any);
  }

  private createGoose(x: number, y: number): void {
    const goose = this.add.graphics();

    // 身体 - 灰色/白色
    goose.fillStyle(0xF5F5F5);
    goose.fillEllipse(0, 0, 26, 18);

    // 长脖子
    goose.lineStyle(6, 0xF5F5F5);
    goose.lineBetween(0, -10, 0, -30);

    // 头部
    goose.fillStyle(0xF5F5F5);
    goose.fillCircle(0, -34, 8);

    // 嘴巴 - 橙色
    goose.fillStyle(0xFF9800);
    goose.fillEllipse(0, -32, 12, 5);

    // 黑色眼睛
    goose.fillStyle(0x000000);
    goose.fillCircle(-3, -35, 2);

    // 翅膀
    goose.fillStyle(0xE0E0E0);
    goose.fillEllipse(-14, 0, 14, 11);

    // 腿
    goose.lineStyle(2, 0xFF9800);
    goose.lineBetween(-6, 9, -10, 18);
    goose.lineBetween(6, 9, 10, 18);

    goose.setPosition(x, y);
    this.geese.push(goose as any);
  }

  /**
   * 装饰元素
   */
  private createDecorations(): void {
    const graphics = this.add.graphics();

    // 风车 - 右上角
    this.drawWindmill(graphics, 700, 380);

    // 干草堆 - 左下角
    this.drawHaystack(graphics, 90, 550);

    // 谷仓 - 远景
    this.drawBarn(graphics, 620, 360);

    // 栅栏柱装饰
    this.drawFencePost(graphics, 500, 520);

    // 木桶
    this.drawBarrel(graphics, 300, 540);

    // 农具 - 耙子
    this.drawRake(graphics, 550, 550);
  }

  private drawWindmill(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 风车塔身
    graphics.fillStyle(0x8D6E63);
    graphics.fillRect(x - 8, y, 16, 60);

    // 风车叶片 - 4片旋转的叶片
    graphics.fillStyle(0xD4A574);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      graphics.save();
      graphics.translateCanvas(x, y);
      graphics.rotateCanvas(angle);
      graphics.fillRect(0, -2, 40, 4);
      graphics.restore();
    }

    // 中心轴
    graphics.fillStyle(0x5D4037);
    graphics.fillCircle(x, y, 5);
  }

  private drawHaystack(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 干草堆 - 金黄色锥形
    graphics.fillStyle(0xD4A574);
    graphics.beginPath();
    graphics.moveTo(x, y - 40);
    graphics.lineTo(x - 30, y);
    graphics.lineTo(x + 30, y);
    graphics.closePath();
    graphics.fillPath();

    // 干草纹理
    graphics.lineStyle(1, 0xBC8F5F);
    for (let i = 0; i < 10; i++) {
      const startX = x + Phaser.Math.Between(-25, 25);
      const startY = y + Phaser.Math.Between(-30, -5);
      graphics.lineBetween(startX, startY, startX + Phaser.Math.Between(-5, 5), startY + 10);
    }
  }

  private drawBarn(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 谷仓 - 红色 barn
    graphics.fillStyle(0xC62828);
    graphics.fillRect(x, y, 80, 50);

    // 屋顶
    graphics.fillStyle(0x8D6E63);
    graphics.beginPath();
    graphics.moveTo(x - 5, y);
    graphics.lineTo(x + 40, y - 25);
    graphics.lineTo(x + 85, y);
    graphics.closePath();
    graphics.fillPath();

    // 门
    graphics.fillStyle(0x5D4037);
    graphics.fillRect(x + 30, y + 15, 20, 35);

    // 窗户
    graphics.fillStyle(0x42A5F5);
    graphics.fillRect(x + 10, y + 10, 12, 12);
    graphics.fillRect(x + 58, y + 10, 12, 12);

    // 窗户框架
    graphics.lineStyle(2, 0xFFFFFF);
    graphics.lineBetween(x + 16, y + 10, x + 16, y + 22);
    graphics.lineBetween(x + 10, y + 16, x + 22, y + 16);
  }

  private drawFencePost(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 栅栏柱
    graphics.fillStyle(0x8D6E63);
    graphics.fillRect(x - 3, y, 6, 40);

    // 柱顶装饰
    graphics.fillStyle(0xA1887F);
    graphics.fillCircle(x, y, 5);
  }

  private drawBarrel(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 木桶
    graphics.fillStyle(0x8D6E63);
    graphics.fillEllipse(x, y, 25, 30);

    // 桶箍
    graphics.lineStyle(2, 0x424242);
    graphics.strokeEllipse(x, y - 8, 25, 6);
    graphics.strokeEllipse(x, y + 8, 25, 6);

    // 桶板纹理
    graphics.lineStyle(1, 0x6D4C41);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bx = x + Math.cos(angle) * 12;
      const by = y + Math.sin(angle) * 15;
      graphics.lineBetween(bx, by - 15, bx, by + 15);
    }
  }

  private drawRake(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 耙柄
    graphics.lineStyle(4, 0x8D6E63);
    graphics.lineBetween(x, y, x, y - 50);

    // 耙头
    graphics.fillStyle(0x6D4C41);
    graphics.fillRect(x - 20, y - 55, 40, 6);

    // 耙齿
    graphics.lineStyle(2, 0x5D4037);
    for (let i = -15; i <= 15; i += 5) {
      graphics.lineBetween(x + i, y - 55, x + i, y - 65);
    }
  }

  /**
   * 动画元素 - 云朵、蝴蝶等
   */
  private createAnimatedElements(): void {
    // 漂浮的云朵
    this.createClouds();

    // 飞舞的蝴蝶
    this.createButterflies();
  }

  private createClouds(): void {
    const graphics = this.add.graphics();

    // 云朵位置 - 随机分布在天空中
    const cloudPositions = [
      { x: 150, y: 80 },
      { x: 400, y: 120 },
      { x: 650, y: 70 }
    ];

    cloudPositions.forEach((pos) => {
      graphics.fillStyle(0xFFFFFF, 0.8);

      // 云朵由多个圆组成
      graphics.fillCircle(pos.x, pos.y, 25);
      graphics.fillCircle(pos.x + 30, pos.y - 5, 20);
      graphics.fillCircle(pos.x + 55, pos.y, 22);
      graphics.fillCircle(pos.x + 15, pos.y - 15, 18);
      graphics.fillCircle(pos.x + 40, pos.y - 12, 20);
    });
  }

  private createButterflies(): void {
    const graphics = this.add.graphics();

    // 蝴蝶 - 3-4只在花丛附近
    const butterflies = [
      { x: 360, y: 440, color: 0xFFB74D },
      { x: 340, y: 460, color: 0xBA68C8 },
      { x: 380, y: 450, color: 0x42A5F5 }
    ];

    butterflies.forEach((bf) => {
      // 左翅
      graphics.fillStyle(bf.color);
      graphics.fillEllipse(bf.x - 6, bf.y, 8, 6);

      // 右翅
      graphics.fillEllipse(bf.x + 6, bf.y, 8, 6);

      // 身体
      graphics.fillStyle(0x000000);
      graphics.fillEllipse(bf.x, bf.y, 2, 8);

      // 翅膀花纹
      graphics.fillStyle(0xFFFFFF, 0.7);
      graphics.fillCircle(bf.x - 6, bf.y, 2);
      graphics.fillCircle(bf.x + 6, bf.y, 2);
    });
  }

  /**
   * 水波纹动画
   */
  private animateWaterRipples(): void {
    const pondX = 150;
    const pondY = 480;
    const currentTime = this.animationTime;

    // 每隔一定时间创建新波纹
    if (Math.floor(currentTime / 1500) % 3 === 0) {
      this.waterRipples.forEach((ripple, index) => {
        if (!ripple.visible) {
          ripple.setVisible(true);
          ripple.clear();
          ripple.lineStyle(1, 0xFFFFFF, 0.6);
          ripple.strokeCircle(pondX, pondY, 5 + index * 10);
          ripple.setData('age', 0);
        }
      });
    }

    // 更新波纹
    this.waterRipples.forEach((ripple) => {
      if (ripple.visible) {
        const age = ripple.getData('age') + 1;
        ripple.setData('age', age);

        const scale = 1 + age * 0.5;
        const alpha = Math.max(0, 0.6 - age * 0.03);

        ripple.clear();
        ripple.lineStyle(1, 0xFFFFFF, alpha);
        ripple.strokeCircle(pondX, pondY, 5 * scale);

        if (alpha <= 0) {
          ripple.setVisible(false);
        }
      }
    });
  }

  /**
   * 家禽动画 - 简单的摇摆效果
   */
  private animateFarmAnimals(): void {
    const currentTime = this.animationTime;

    // 鸡的摇摆
    this.chickens.forEach((chicken, i) => {
      const offset = Math.sin(currentTime / 300 + i) * 2;
      chicken.y += offset;
    });

    // 鸭子的摇摆
    this.ducks.forEach((duck, i) => {
      const offset = Math.sin(currentTime / 250 + i) * 3;
      duck.y += offset;
    });

    // 鹅的摇摆
    this.geese.forEach((goose, i) => {
      const offset = Math.sin(currentTime / 350 + i) * 2;
      goose.y += offset;
    });
  }
}
