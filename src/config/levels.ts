export interface LevelConfig {
  number: number;
  name: string;
  startingMoney: number;
  maxLives: number;
  waves: WaveConfig[][];
}

export interface WaveConfig {
  enemyKey: string;
  count: number;
  interval: number;
}

export const LEVELS: LevelConfig[] = [
  {
    number: 1,
    name: '宁静农庄',
    startingMoney: 300,
    maxLives: 10,
    waves: [
      [{ enemyKey: 'rabbit', count: 5, interval: 2000 }],
      [{ enemyKey: 'rabbit', count: 8, interval: 1500 }],
      [{ enemyKey: 'rabbit', count: 10, interval: 1200 }, { enemyKey: 'boar', count: 2, interval: 3000 }]
    ]
  },
  {
    number: 2,
    name: '野猪来袭',
    startingMoney: 400,
    maxLives: 10,
    waves: [
      [{ enemyKey: 'boar', count: 3, interval: 2500 }],
      [{ enemyKey: 'rabbit', count: 10, interval: 1000 }, { enemyKey: 'boar', count: 4, interval: 2000 }],
      [{ enemyKey: 'boar', count: 6, interval: 1800 }]
    ]
  }
];
