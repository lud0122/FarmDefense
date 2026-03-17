export type EnemyBehaviorType = 'rush' | 'towerBreaker';

export interface BehaviorControlledEnemy {
  x: number;
  y: number;
  currentSpeed: number;
  config: { key: string };
  moveByBehaviorDefault(delta: number): void;
  moveToPoint(targetX: number, targetY: number, delta: number): void;
}

export interface EnemyBehaviorContext {
  getTowers: () => Array<{
    x: number;
    y: number;
    active: boolean;
    takeDamage: (amount: number) => void;
  }>;
}

export interface EnemyBehavior {
  getType(): EnemyBehaviorType;
  update(enemy: BehaviorControlledEnemy, context: EnemyBehaviorContext, time: number, delta: number): void;
}
