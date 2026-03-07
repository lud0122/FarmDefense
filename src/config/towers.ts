export interface TowerConfig {
  key: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  color: number;
}

export const TOWERS: Record<string, TowerConfig> = {
  pistol: {
    key: 'pistol',
    name: '手枪塔',
    cost: 50,
    range: 150,
    damage: 10,
    fireRate: 500,
    color: 0x4682B4
  },
  machinegun: {
    key: 'machinegun',
    name: '机枪塔',
    cost: 150,
    range: 120,
    damage: 5,
    fireRate: 100,
    color: 0x2F4F4F
  },
  grenade: {
    key: 'grenade',
    name: '榴弹塔',
    cost: 200,
    range: 100,
    damage: 30,
    fireRate: 1000,
    color: 0x556B2F
  },
  ice: {
    key: 'ice',
    name: '冰冻塔',
    cost: 120,
    range: 130,
    damage: 5,
    fireRate: 600,
    color: 0x87CEEB
  },
  electric: {
    key: 'electric',
    name: '电击塔',
    cost: 180,
    range: 80,
    damage: 15,
    fireRate: 400,
    color: 0xFFD700
  },
  sentinel: {
    key: 'sentinel',
    name: '哨戒塔',
    cost: 80,
    range: 200,
    damage: 8,
    fireRate: 800,
    color: 0x9370DB
  }
};
