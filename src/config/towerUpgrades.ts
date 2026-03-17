// src/config/towerUpgrades.ts

export type UpgradeType = 'ability' | 'evolution';

export interface SpecialAbility {
  type: 'pierce' | 'stun' | 'slow_aura' | 'burn' | 'chain' | 'mark' | 'freeze';
  value?: number;
  duration?: number;
  targets?: number;
  chance?: number;
}

export interface UpgradeEffect {
  damageMultiplier?: number;
  rangeMultiplier?: number;
  fireRateMultiplier?: number;
  specialAbility?: SpecialAbility;
}

export interface TowerUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: UpgradeType;
  baseCost: number;
  effect: UpgradeEffect;
  requiredTowerLevel?: number;
  unlocksAtWave: number;
  evolutionTarget?: string;
}

export interface TowerUpgradeConfig {
  abilities: TowerUpgrade[];
  evolutions: TowerUpgrade[];
}

export const TOWER_UPGRADES: Record<string, TowerUpgradeConfig> = {
  pistol: {
    abilities: [
      {
        id: 'pistol_ability_1',
        name: '快速装填',
        description: '攻速+30%',
        icon: '⚡',
        type: 'ability',
        baseCost: 60,
        effect: { fireRateMultiplier: 0.7 },
        unlocksAtWave: 3,
      },
      {
        id: 'pistol_ability_2',
        name: '穿透子弹',
        description: '子弹可穿透1个敌人',
        icon: '➡️',
        type: 'ability',
        baseCost: 80,
        effect: { specialAbility: { type: 'pierce', targets: 1 } },
        unlocksAtWave: 5,
      },
    ],
    evolutions: [
      {
        id: 'pistol_evolve_shotgun',
        name: '散弹塔',
        description: '一次发射3颗子弹',
        icon: '💥',
        type: 'evolution',
        baseCost: 150,
        effect: { damageMultiplier: 0.6, rangeMultiplier: 0.8 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'shotgun',
      },
      {
        id: 'pistol_evolve_sniper',
        name: '狙击塔',
        description: '超远射程,高伤害',
        icon: '🎯',
        type: 'evolution',
        baseCost: 150,
        effect: { damageMultiplier: 1.8, rangeMultiplier: 2.0, fireRateMultiplier: 2.0 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'sniper',
      },
    ],
  },
  machinegun: {
    abilities: [
      {
        id: 'machinegun_ability_1',
        name: '铅弹',
        description: '伤害+25%',
        icon: '⚙️',
        type: 'ability',
        baseCost: 70,
        effect: { damageMultiplier: 1.25 },
        unlocksAtWave: 4,
      },
      {
        id: 'machinegun_ability_2',
        name: '弹幕压制',
        description: '5%概率眩晕敌人0.5秒',
        icon: '🌀',
        type: 'ability',
        baseCost: 90,
        effect: { specialAbility: { type: 'stun', duration: 500, chance: 0.05 } },
        unlocksAtWave: 6,
      },
    ],
    evolutions: [
      {
        id: 'machinegun_evolve_gatling',
        name: '加特林塔',
        description: '超高攻速',
        icon: '🔫',
        type: 'evolution',
        baseCost: 180,
        effect: { fireRateMultiplier: 0.5, damageMultiplier: 0.7 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'gatling',
      },
      {
        id: 'machinegun_evolve_precision',
        name: '精准机枪',
        description: '远程精准射击',
        icon: '🎯',
        type: 'evolution',
        baseCost: 180,
        effect: { rangeMultiplier: 1.4 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'precision_machinegun',
      },
    ],
  },
  cannon: {
    abilities: [
      {
        id: 'cannon_ability_1',
        name: '燃烧弹',
        description: '造成持续燃烧伤害',
        icon: '🔥',
        type: 'ability',
        baseCost: 100,
        effect: { specialAbility: { type: 'burn', value: 5, duration: 3000 } },
        unlocksAtWave: 5,
      },
      {
        id: 'cannon_ability_2',
        name: '爆裂弹头',
        description: '伤害+40%',
        icon: '💥',
        type: 'ability',
        baseCost: 120,
        effect: { damageMultiplier: 1.4 },
        unlocksAtWave: 7,
      },
    ],
    evolutions: [
      {
        id: 'cannon_evolve_rocket',
        name: '火箭炮塔',
        description: '范围爆炸伤害',
        icon: '🚀',
        type: 'evolution',
        baseCost: 200,
        effect: { damageMultiplier: 1.5, rangeMultiplier: 1.2 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'rocket',
      },
      {
        id: 'cannon_evolve_mortar',
        name: '迫击炮塔',
        description: '超远程范围攻击',
        icon: '📍',
        type: 'evolution',
        baseCost: 200,
        effect: { rangeMultiplier: 2.5, fireRateMultiplier: 1.5 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'mortar',
      },
    ],
  },
  frost: {
    abilities: [
      {
        id: 'frost_ability_1',
        name: '深度冻结',
        description: '减速效果+50%',
        icon: '❄️',
        type: 'ability',
        baseCost: 80,
        effect: { specialAbility: { type: 'slow_aura', value: 0.5 } },
        unlocksAtWave: 4,
      },
      {
        id: 'frost_ability_2',
        name: '冰霜印记',
        description: '被冻结的敌人受到+30%伤害',
        icon: '💠',
        type: 'ability',
        baseCost: 100,
        effect: { specialAbility: { type: 'mark', value: 1.3 } },
        unlocksAtWave: 6,
      },
    ],
    evolutions: [
      {
        id: 'frost_evolve_blizzard',
        name: '暴风雪塔',
        description: '范围冻结攻击',
        icon: '🌨️',
        type: 'evolution',
        baseCost: 180,
        effect: { rangeMultiplier: 1.5, specialAbility: { type: 'freeze', duration: 1000 } },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'blizzard',
      },
      {
        id: 'frost_evolve_permafrost',
        name: '永冻塔',
        description: '永久减速区域',
        icon: '🧊',
        type: 'evolution',
        baseCost: 180,
        effect: { specialAbility: { type: 'slow_aura', value: 0.3, duration: 999999 } },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'permafrost',
      },
    ],
  },
  electric: {
    abilities: [
      {
        id: 'electric_ability_1',
        name: '连锁闪电',
        description: '攻击弹射到2个额外目标',
        icon: '⚡',
        type: 'ability',
        baseCost: 90,
        effect: { specialAbility: { type: 'chain', targets: 2 } },
        unlocksAtWave: 4,
      },
      {
        id: 'electric_ability_2',
        name: '过载',
        description: '伤害+35%',
        icon: '🔌',
        type: 'ability',
        baseCost: 110,
        effect: { damageMultiplier: 1.35 },
        unlocksAtWave: 6,
      },
    ],
    evolutions: [
      {
        id: 'electric_evolve_tesla',
        name: '特斯拉塔',
        description: '持续电弧伤害',
        icon: '🔮',
        type: 'evolution',
        baseCost: 190,
        effect: { specialAbility: { type: 'chain', targets: 4 } },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'tesla',
      },
      {
        id: 'electric_evolve_storm',
        name: '风暴塔',
        description: '召唤闪电风暴',
        icon: '🌩️',
        type: 'evolution',
        baseCost: 190,
        effect: { rangeMultiplier: 2.0, damageMultiplier: 0.8 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'storm',
      },
    ],
  },
  laser: {
    abilities: [
      {
        id: 'laser_ability_1',
        name: '聚焦透镜',
        description: '射程+40%',
        icon: '🔍',
        type: 'ability',
        baseCost: 110,
        effect: { rangeMultiplier: 1.4 },
        unlocksAtWave: 5,
      },
      {
        id: 'laser_ability_2',
        name: '灼热光线',
        description: '伤害+50%',
        icon: '☀️',
        type: 'ability',
        baseCost: 130,
        effect: { damageMultiplier: 1.5 },
        unlocksAtWave: 7,
      },
    ],
    evolutions: [
      {
        id: 'laser_evolve_plasma',
        name: '等离子塔',
        description: '高伤害持续激光',
        icon: '🌟',
        type: 'evolution',
        baseCost: 210,
        effect: { damageMultiplier: 2.0, fireRateMultiplier: 0.5 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'plasma',
      },
      {
        id: 'laser_evolve_quantum',
        name: '量子塔',
        description: '无视距离衰减',
        icon: '⚛️',
        type: 'evolution',
        baseCost: 210,
        effect: { rangeMultiplier: 3.0, damageMultiplier: 1.2 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'quantum',
      },
    ],
  },
};

// 辅助函数：通过ID查找升级
export function getTowerUpgradeById(upgradeId: string): TowerUpgrade | null {
  for (const towerKey in TOWER_UPGRADES) {
    const config = TOWER_UPGRADES[towerKey];
    const ability = config.abilities.find(a => a.id === upgradeId);
    if (ability) return ability;
    const evolution = config.evolutions.find(e => e.id === upgradeId);
    if (evolution) return evolution;
  }
  return null;
}

// 辅助函数：获取所有进化目标类型
export function getEvolutionTypes(towerKey: string): string[] {
  const config = TOWER_UPGRADES[towerKey];
  if (!config) return [];
  return config.evolutions.map(e => e.evolutionTarget).filter(Boolean) as string[];
}
