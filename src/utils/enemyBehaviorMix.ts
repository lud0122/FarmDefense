import { EnemyBehaviorType } from '../entities/behaviors/EnemyBehavior';

export interface BehaviorMixConfig {
  rushRatio: number;
  towerBreakerRatio: number;
}

export const buildFixedBehaviorMix = (totalCount: number, rushRatio: number): EnemyBehaviorType[] => {
  const rushCount = Math.round(totalCount * rushRatio);
  const towerBreakerCount = totalCount - rushCount;

  return [
    ...Array.from({ length: rushCount }, () => 'rush' as const),
    ...Array.from({ length: towerBreakerCount }, () => 'towerBreaker' as const)
  ];
};

export const shuffleBehaviorMix = (
  mix: EnemyBehaviorType[],
  rng: () => number = Math.random
): EnemyBehaviorType[] => {
  const shuffled = [...mix];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const next = shuffled[j];
    shuffled[j] = shuffled[i];
    shuffled[i] = next;
  }
  return shuffled;
};
