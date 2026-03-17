import { EnemyConfig } from '../config/enemies';

export interface ResolvedAttackConfig {
  attackDamage: number;
  attackCooldown: number;
  attackRange: number;
  isValidForTowerBreaker: boolean;
}

export const resolveEnemyAttackConfig = (config: EnemyConfig): ResolvedAttackConfig => {
  const attackDamage = config.attackDamage ?? 0;
  const attackCooldown = config.attackCooldown ?? Number.POSITIVE_INFINITY;
  const attackRange = config.attackRange ?? 0;

  const isValidForTowerBreaker = attackDamage > 0 && Number.isFinite(attackCooldown) && attackCooldown > 0 && attackRange > 0;

  return {
    attackDamage,
    attackCooldown,
    attackRange,
    isValidForTowerBreaker
  };
};
