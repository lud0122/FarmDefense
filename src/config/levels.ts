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
      // 第1波：快速野兔群
      [{ enemyKey: 'rabbit', count: 8, interval: 1200 }],
      // 第2波：兔子大队
      [{ enemyKey: 'rabbit', count: 15, interval: 1000 }],
      // 第3波：混合入侵
      [{ enemyKey: 'rabbit', count: 12, interval: 900 }, { enemyKey: 'boar', count: 3, interval: 2500 }],
      // 第4波：野猪突袭
      [{ enemyKey: 'boar', count: 5, interval: 1800 }],
      // 第5波：终极混合
      [{ enemyKey: 'rabbit', count: 15, interval: 800 }, { enemyKey: 'boar', count: 5, interval: 2000 }, { enemyKey: 'fox', count: 2, interval: 3000 }]
    ]
  },
  {
    number: 2,
    name: '野猪来袭',
    startingMoney: 400,
    maxLives: 10,
    waves: [
      [{ enemyKey: 'boar', count: 8, interval: 1500 }],
      [{ enemyKey: 'rabbit', count: 20, interval: 600 }, { enemyKey: 'boar', count: 6, interval: 1500 }],
      [{ enemyKey: 'fox', count: 4, interval: 2000 }],
      [{ enemyKey: 'eagle', count: 3, interval: 2500 }],
      [{ enemyKey: 'boar', count: 8, interval: 1200 }, { enemyKey: 'fox', count: 4, interval: 2000 }]
    ]
  },
  {
    number: 3,
    name: '野兽之王',
    startingMoney: 500,
    maxLives: 10,
    waves: [
      [{ enemyKey: 'boar', count: 10, interval: 1200 }],
      [{ enemyKey: 'fox', count: 6, interval: 1500 }],
      [{ enemyKey: 'eagle', count: 5, interval: 1800 }],
      [{ enemyKey: 'bear', count: 2, interval: 4000 }],
      // Boss战
      [{ enemyKey: 'boar', count: 15, interval: 1000 }, { enemyKey: 'fox', count: 8, interval: 1800 }, { enemyKey: 'bear', count: 3, interval: 3500 }]
    ]
  }
];
