import Phaser from 'phaser';

export class ProjectileManager {
  private projectiles: any[] = [];

  constructor(_scene: Phaser.Scene) {}

  public addProjectile(projectile: any): void {
    this.projectiles.push(projectile);
  }

  public update(time: number, delta: number): void {
    // 更新所有活跃的子弹
    // 支持 GameObject 和自定义 projectile wrapper
    this.projectiles = this.projectiles.filter(p => {
      const isActive = p.active || (p.isSpriteActive && p.isSpriteActive());
      return isActive;
    });

    for (const projectile of this.projectiles) {
      if (projectile.update) {
        projectile.update(time, delta);
      }
    }
  }

  public clear(): void {
    for (const projectile of this.projectiles) {
      if (projectile.active) {
        projectile.destroy();
      }
    }
    this.projectiles = [];
  }

  public getProjectileCount(): number {
    return this.projectiles.filter(p => p.active).length;
  }
}
