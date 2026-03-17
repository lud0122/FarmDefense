export interface LevelBehaviorMixConfig {
  rushRatio: number;
  towerBreakerRatio: number;
}

export interface LevelConfig {
  number: number;
  name: string;
  startingMoney: number;
  maxLives: number;
  waves: WaveConfig[][];
  isSmartLevel?: boolean; // New field for Level 5
  behaviorMix?: LevelBehaviorMixConfig;
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
    startingMoney: 500,
    maxLives: 20,
    waves: [
      // 第1波：兔子大军
      [{ enemyKey: 'rabbit', count: 20, interval: 400 }],
      // 第2波：更多兔子 + 野猪
      [{ enemyKey: 'rabbit', count: 30, interval: 300 }, { enemyKey: 'boar', count: 5, interval: 1500 }],
      // 第3波：混合入侵
      [{ enemyKey: 'rabbit', count: 25, interval: 250 }, { enemyKey: 'boar', count: 8, interval: 1200 }, { enemyKey: 'fox', count: 3, interval: 2000 }],
      // 第4波：野猪大军
      [{ enemyKey: 'boar', count: 15, interval: 800 }],
      // 第5波：终极混合
      [{ enemyKey: 'rabbit', count: 40, interval: 200 }, { enemyKey: 'boar', count: 12, interval: 1000 }, { enemyKey: 'fox', count: 5, interval: 1500 }]
    ]
  },
  {
    number: 2,
    name: '野猪来袭',
    startingMoney: 800,
    maxLives: 20,
    waves: [
      // 第1波：野猪群
      [{ enemyKey: 'boar', count: 20, interval: 600 }],
      // 第2波：兔子海 + 野猪
      [{ enemyKey: 'rabbit', count: 50, interval: 200 }, { enemyKey: 'boar', count: 15, interval: 800 }],
      // 第3波：狐狸 + 野猪
      [{ enemyKey: 'fox', count: 15, interval: 1000 }, { enemyKey: 'boar', count: 20, interval: 700 }],
      // 第4波：老鹰 + 混合
      [{ enemyKey: 'eagle', count: 12, interval: 1200 }, { enemyKey: 'fox', count: 10, interval: 1500 }],
      // 第5波：空虚混合大军
      [{ enemyKey: 'rabbit', count: 40, interval: 300 }, { enemyKey: 'boar', count: 20, interval: 600 }, { enemyKey: 'fox', count: 15, interval: 1000 }]
    ]
  },
  {
    number: 3,
    name: '野兽之王',
    startingMoney: 1000,
    maxLives: 25,
    waves: [
      // 第1波：野猪大军
      [{ enemyKey: 'boar', count: 30, interval: 500 }],
      // 第2波：狐狸军团
      [{ enemyKey: 'fox', count: 25, interval: 800 }],
      // 第3波：老鹰空袭
      [{ enemyKey: 'eagle', count: 20, interval: 1000 }],
      // 第4波：熊 Boss
      [{ enemyKey: 'bear', count: 5, interval: 2500 }],
      // 第5波：Boss战 - 所有动物大军
      [
        { enemyKey: 'rabbit', count: 50, interval: 150 },
        { enemyKey: 'boar', count: 30, interval: 400 },
        { enemyKey: 'fox', count: 25, interval: 600 },
        { enemyKey: 'eagle', count: 15, interval: 900 },
        { enemyKey: 'bear', count: 8, interval: 2000 }
      ]
    ]
  },
  // 新增第4关：动物灾难
  {
    number: 4,
    name: '动物灾难',
    startingMoney: 1500,
    maxLives: 30,
    waves: [
      // 第1波：无穷兔子
      [{ enemyKey: 'rabbit', count: 80, interval: 100 }],
      // 第2波：野猪冲锋
      [{ enemyKey: 'boar', count: 50, interval: 300 }],
      // 第3波：狐狸突袭
      [{ enemyKey: 'fox', count: 40, interval: 400 }],
      // 第4波：熊群
      [{ enemyKey: 'bear', count: 15, interval: 1500 }],
      // 第5波：末日混合 - 超大规模
      [
        { enemyKey: 'rabbit', count: 100, interval: 100 },
        { enemyKey: 'boar', count: 50, interval: 250 },
        { enemyKey: 'fox', count: 40, interval: 350 },
        { enemyKey: 'eagle', count: 30, interval: 500 },
        { enemyKey: 'bear', count: 12, interval: 1200 }
      ]
    ]
  },
  // 新增第5关：智慧农场
  {
    number: 5,
    name: '智慧农场',
    startingMoney: 2000,
    maxLives: 30,
    isSmartLevel: true,
    waves: [
      // 第1波：智慧兔群
      [{ enemyKey: 'smartRabbit', count: 25, interval: 500 }],
      // 第2波：智慧野猪
      [{ enemyKey: 'smartBoar', count: 15, interval: 800 }],
      // 第3波：智慧狐狸突袭
      [{ enemyKey: 'smartFox', count: 20, interval: 600 }],
      // 第4波：智慧老鹰空袭
      [{ enemyKey: 'smartEagle', count: 18, interval: 700 }],
      // 第5波：智慧熊群
      [{ enemyKey: 'smartBear', count: 10, interval: 1500 }],
      // 第6波：智慧混合大军
      [
        { enemyKey: 'smartRabbit', count: 35, interval: 400 },
        { enemyKey: 'smartBoar', count: 20, interval: 700 },
        { enemyKey: 'smartFox', count: 15, interval: 550 },
        { enemyKey: 'smartEagle', count: 12, interval: 650 },
        { enemyKey: 'smartBear', count: 8, interval: 1300 }
      ]
    ]
  },
  // 新增第6关：动物反击
  {
    number: 6,
    name: '动物反击',
    startingMoney: 2400,
    maxLives: 35,
    behaviorMix: {
      rushRatio: 0.3,
      towerBreakerRatio: 0.7
    },
    waves: [
      [{ enemyKey: 'rabbit', count: 24, interval: 320 }, { enemyKey: 'boar', count: 8, interval: 900 }],
      [{ enemyKey: 'fox', count: 18, interval: 420 }, { enemyKey: 'boar', count: 10, interval: 850 }],
      [{ enemyKey: 'rabbit', count: 30, interval: 240 }, { enemyKey: 'fox', count: 16, interval: 450 }, { enemyKey: 'eagle', count: 10, interval: 700 }],
      [{ enemyKey: 'boar', count: 18, interval: 700 }, { enemyKey: 'bear', count: 6, interval: 1500 }],
      [{ enemyKey: 'rabbit', count: 40, interval: 200 }, { enemyKey: 'boar', count: 20, interval: 600 }, { enemyKey: 'fox', count: 22, interval: 350 }, { enemyKey: 'eagle', count: 14, interval: 550 }, { enemyKey: 'bear', count: 8, interval: 1300 }]
    ]
  }
];
