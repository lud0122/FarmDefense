/**
 * ParticleFactory - 粒子效果工厂类
 * 提供静态方法创建攻击、受伤、修复粒子效果
 */

export class ParticleFactory {
  /**
   * 创建攻击粒子 - 从敌人飞向塔
   */
  static createAttackParticles(
    scene: Phaser.Scene,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): void {
    const particleCount = 5;
    const duration = 300;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.createParticle(scene, fromX, fromY, 0xFFAA00, 4);

      scene.tweens.add({
        targets: particle,
        x: toX,
        y: toY,
        duration: duration + Math.random() * 100,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * 创建受伤粒子 - 在目标位置爆发
   */
  static createDamageParticles(
    scene: Phaser.Scene,
    x: number,
    y: number,
    count: number = 8
  ): void {
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle(scene, x, y, 0x666666, 3);
      const angle = Phaser.Math.DegToRad(240 + Math.random() * 60);
      const speed = 50 + Math.random() * 100;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      scene.tweens.add({
        targets: particle,
        x: particle.x + velocityX,
        y: particle.y + velocityY + 50,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * 创建修复粒子 - 从底部向上飞散
   */
  static createRepairParticles(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): void {
    const particleCount = 12;
    const colors = [0x00FF00, 0xFFD700, 0xADFF2F];

    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this.createParticle(scene, x, y, color, 4);
      const offsetX = (Math.random() - 0.5) * 30;
      const targetY = y - 60 - Math.random() * 40;

      scene.tweens.add({
        targets: particle,
        x: x + offsetX,
        y: targetY,
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.5 },
        duration: 800,
        ease: 'Sine.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * 创建单个粒子对象
   */
  private static createParticle(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    size: number
  ): Phaser.GameObjects.Graphics {
    const particle = scene.add.graphics();
    particle.fillStyle(color, 1);
    particle.fillCircle(0, 0, size);
    particle.x = x;
    particle.y = y;
    return particle;
  }
}
