export interface EnemyConfig {
  key: string;
  name: string;
  health: number;
  speed: number;
  reward: number;
  size: number;
  color: number;
}

export const ENEMIES: Record<string, EnemyConfig> = {
  rabbit: {
    key: 'rabbit',
    name: '野兔',
    health: 20,
    speed: 150,
    reward: 10,
    size: 16,
    color: 0xD2B48C
  },
  boar: {
    key: 'boar',
    name: '野猪',
    health: 100,
    speed: 80,
    reward: 25,
    size: 24,
    color: 0x8B4513
  },
  fox: {
    key: 'fox',
    name: '狐狸',
    health: 50,
    speed: 120,
    reward: 15,
    size: 20,
    color: 0xFF6347
  },
  eagle: {
    key: 'eagle',
    name: '秃鹰',
    health: 40,
    speed: 140,
    reward: 20,
    size: 18,
    color: 0x808080
  },
  bear: {
    key: 'bear',
    name: '熊',
    health: 300,
    speed: 50,
    reward: 100,
    size: 32,
    color: 0x654321
  }
};
