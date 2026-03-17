import { EnemyBehavior, EnemyBehaviorContext, BehaviorControlledEnemy } from './EnemyBehavior';

export class RushBehavior implements EnemyBehavior {
  public getType(): 'rush' {
    return 'rush';
  }

  public update(enemy: BehaviorControlledEnemy, _context: EnemyBehaviorContext, _time: number, delta: number): void {
    enemy.moveByBehaviorDefault(delta);
  }
}
