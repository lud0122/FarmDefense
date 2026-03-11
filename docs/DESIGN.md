# Farm Defender - 技术设计文档

## 1. 项目概述

### 1.1 游戏简介
**Farm Defender** 是一款基于 TypeScript + Phaser 3 开发的塔防游戏。玩家需要在农场上建造各种防御塔，抵御一波波来袭的野生动物，保护自己的农场。

### 1.2 技术栈
- **语言**: TypeScript (ES2020)
- **游戏引擎**: Phaser 3.70
- **构建工具**: Vite 5.x
- **打包器**: ESBuild
- **部署**: GitHub Pages

---

## 2. 架构设计

### 2.1 目录结构
```
src/
├── main.ts                    # 游戏入口，场景注册
├── config/                    # 游戏配置（数据驱动）
│   ├── constants.ts          # 全局常量、路径点
│   ├── enemies.ts            # 敌人类型定义
│   ├── towers.ts             # 塔楼类型定义
│   └── levels.ts             # 关卡/波次配置
├── game/                      # Phaser 场景
│   ├── BootScene.ts          # 初始化、资源加载
│   ├── MenuScene.ts          # 主菜单
│   ├── GameScene.ts          # 主游戏场景
│   └── GameOverScene.ts      # 胜利/失败画面
├── entities/                  # 游戏实体（继承 Phaser）
│   ├── Enemy.ts              # 敌人基类
│   ├── Projectile.ts         # 子弹基类
│   ├── Tower.ts              # 塔楼基类
│   ├── PlayerHelicopter.ts   # 玩家直升机
│   └── towers/               # 具体塔楼实现
│       ├── PistolTower.ts
│       ├── MachineGunTower.ts
│       ├── GrenadeTower.ts
│       ├── IceTower.ts
│       ├── ElectricTower.ts
│       └── SentinelTower.ts
└── systems/                   # 游戏逻辑系统
    ├── EnemyManager.ts       # 敌人生成与生命周期
    ├── TowerManager.ts       # 塔楼放置与目标锁定
    ├── ProjectileManager.ts  # 子弹生命周期
    ├── EconomySystem.ts      # 金币经济系统
    └── AudioSystem.ts        # 音效系统
```

### 2.2 核心架构模式

#### Manager 模式
所有游戏实体都由专门的 Manager 类管理：
- **EnemyManager**: 负责敌人的生成、更新和销毁
- **TowerManager**: 负责塔楼的放置、升级和回收
- **ProjectileManager**: 负责子弹的创建、更新和销毁

#### Config-Driven Design
所有游戏平衡数据定义在 `config/` 目录：
- 敌人属性（生命值、速度、金币奖励）
- 塔楼属性（成本、射程、伤害、攻击速度）
- 关卡配置（波次、敌人类型、数量）

#### Scene-Based Architecture
使用 Phaser Scenes 管理游戏状态：
```
BootScene → MenuScene → GameScene → GameOverScene
```

---

## 3. 核心系统详解

### 3.1 敌人系统 (EnemySystem)

#### 敌人行为流程
1. **生成**: EnemyManager 根据关卡配置生成敌人
2. **移动**: 敌人沿预定义路径点（PATH_POINTS）移动
3. **到达终点**: 扣除玩家生命值
4. **死亡**: 给予金币奖励

#### 路径系统
```typescript
const PATH_POINTS = [
  { x: 0, y: 300 },     // 起点（左侧）
  { x: 200, y: 300 },
  { x: 200, y: 100 },
  { x: 600, y: 100 },
  { x: 600, y: 500 },
  { x: 400, y: 500 },
  { x: 400, y: 300 },
  { x: 800, y: 300 }    // 终点（右侧）
];
```

#### 敌人类型
| 敌人 | 生命值 | 速度 | 金币奖励 | 特点 |
|------|--------|------|----------|------|
| 野兔 | 20 | 150 | 10 | 速度快，血量低 |
| 野猪 | 100 | 80 | 25 | 血量高，速度慢 |
| 狐狸 | 50 | 120 | 15 | 平衡型 |
| 秃鹰 | 40 | 140 | 20 | 速度较快 |
| 熊 | 300 | 50 | 100 | Boss级，超高血量 |

### 3.2 塔楼系统 (TowerSystem)

#### 塔楼基类设计
```typescript
class Tower extends Phaser.GameObjects.Container {
  config: TowerConfig;        // 配置数据
  lastFireTime: number;       // 上次攻击时间
  rangeCircle: Graphics;      // 射程显示
  findTarget(enemies): Enemy  // 目标查找
  fire(target): Projectile    // 发射子弹
}
```

#### 塔楼类型对比
| 塔楼 | 成本 | 射程 | 伤害 | 攻速 | 特殊效果 |
|------|------|------|------|------|----------|
| 手枪塔 | 50 | 150 | 10 | 500ms | 基础单体 |
| 机枪塔 | 150 | 120 | 5 | 100ms | 高速连射 |
| 榴弹塔 | 200 | 100 | 30 | 1000ms | 范围伤害 |
| 冰冻塔 | 120 | 130 | 5 | 600ms | 减速50% |
| 电击塔 | 180 | 80 | 15 | 400ms | 连锁攻击 |
| 哨戒塔 | 80 | 200 | 8 | 800ms | 超长射程 |

#### 攻击范围预览
- 选中塔楼后，鼠标移动到游戏区域时自动显示攻击范围
- 显示为绿色半透明圆形区域
- 帮助玩家决策塔的最佳放置位置

### 3.3 子弹系统 (ProjectileSystem)

#### 子弹类型
| 子弹 | 来源 | 效果 |
|------|------|------|
| 普通子弹 | 手枪塔/机枪塔 | 直线射击，单体伤害 |
| 榴弹 | 榴弹塔 | 落地爆炸，范围伤害 |
| 冰弹 | 冰冻塔 | 单体伤害+减速效果 |
| 闪电 | 电击塔 | 命中后连锁到附近敌人 |
| 追踪导弹 | 哨戒塔 | 自动追踪目标 |

#### 伤害计算公式
```typescript
// 普通伤害
actualDamage = tower.damage

// 榴弹范围伤害（距离越近伤害越高）
actualDamage = baseDamage * (1 - distance / explosionRadius)

// 减速效果
enemy.speed *= 0.5  // 持续2秒
```

### 3.4 经济系统 (EconomySystem)

#### 金币获取
- 击杀敌人：获得敌人配置的 reward 金币
- 回收塔楼：获得建造成本的 50%

#### 经济平衡
- 起始金币：500-1500（根据关卡）
- 塔楼成本：50-200 金币
- 击杀奖励：10-100 金币

### 3.5 玩家直升机系统

#### 控制方式
- **移动**: WASD 键
- **自动射击**: 范围内自动瞄准敌人
- **射程显示**: R 键切换

#### 属性
- 移动速度：200
- 攻击范围：200
- 攻击间隔：300ms
- 伤害：15

---

## 4. 数据流

### 4.1 敌人生成流程
```
GameScene.startNextWave()
    ↓
EnemyManager.spawnWave(enemyConfigs)
    ↓
EnemyManager.update() → Enemy.moveAlongPath()
```

### 4.2 战斗流程
```
TowerManager.update()
    ↓
Tower.findTarget() → 锁定目标
    ↓
Tower.fire() → 创建 Projectile
    ↓
ProjectileManager.update()
    ↓
Projectile.hit() → Enemy.takeDamage()
    ↓
Enemy.onDeath() → EconomySystem.addMoney()
```

### 4.3 塔楼放置流程
```
玩家点击塔楼按钮
    ↓
GameScene.selectTower(key)
    ↓
鼠标移动 → 显示攻击范围预览
    ↓
玩家点击地图空白处
    ↓
GameScene.handleClick() → 检查金币
    ↓
TowerManager.placeTower() → 创建塔楼实例
    ↓
EconomySystem.spendMoney()
```

---

## 5. UI 系统

### 5.1 游戏界面布局
```
+------------------------------------------+
|  ❤️ Lives              Wave X             |
|------------------------------------------|
|                                          |
|              游戏区域                     |
|         (包含路径、塔楼、敌人)             |
|                                          |
|------------------------------------------|
|  [塔1] [塔2] [塔3] [塔4] [塔5] [塔6]     |
|   $50   $150  $200  $120  $180  $80     |
+------------------------------------------+
```

### 5.2 交互设计
- **左键点击塔楼按钮**: 选中/取消选中
- **左键点击地图**: 放置塔楼
- **右键点击塔楼**: 显示回收菜单
- **数字键 1-6**: 快速选择塔楼
- **ESC 键**: 取消当前选择

---

## 6. 关卡设计

### 6.1 关卡配置结构
```typescript
interface LevelConfig {
  number: number;           // 关卡编号
  name: string;            // 关卡名称
  startingMoney: number;   // 起始金币
  maxLives: number;        // 最大生命值
  waves: WaveConfig[][];   // 波次配置
}

interface WaveConfig {
  enemyKey: string;        // 敌人类型
  count: number;          // 敌人数量
  interval: number;       // 生成间隔(ms)
}
```

### 6.2 关卡难度曲线
| 关卡 | 起始金币 | 生命值 | 敌人种类 | 难度特点 |
|------|----------|--------|----------|----------|
| 1 | 500 | 20 | 兔、野猪、狐狸 | 入门教学 |
| 2 | 800 | 20 | 加入老鹰 | 空中威胁 |
| 3 | 1000 | 25 | 加入熊Boss | Boss战 |
| 4 | 1500 | 30 | 全部敌人 | 极限挑战 |

---

## 7. 性能优化

### 7.1 优化策略
- **对象池**: 重用 Projectile 对象（计划中）
- **空间分割**: 四叉树优化碰撞检测（计划中）
- **延迟加载**: 按需加载音频资源
- **渲染优化**: 使用 Depth 层级管理绘制顺序

### 7.2 性能指标
- 目标帧率: 60 FPS
- 最大敌人数量: 100+
- 最大塔楼数量: 50+
- 内存占用: < 100MB

---

## 8. 扩展性设计

### 8.1 添加新敌人类型
1. 在 `src/config/enemies.ts` 添加配置
2. 系统会自动支持，无需代码修改

### 8.2 添加新塔楼类型
1. 在 `src/config/towers.ts` 添加配置
2. 创建 `src/entities/towers/NewTower.ts`
3. 继承 `Tower` 类，实现 `fire()` 方法
4. 在 `TowerManager.placeTower()` 添加 case

### 8.3 添加新关卡
1. 在 `src/config/levels.ts` 添加配置
2. 更新 `GameScene.startNextWave()` 支持新关卡

---

## 9. 技术债务与改进计划

### 9.1 已知问题
- [ ] 大型波次时性能下降
- [ ] 缺少移动端适配
- [ ] 音效系统需要更多音效

### 9.2 未来改进
- [ ] 添加存档功能
- [ ] 添加成就系统
- [ ] 添加更多塔楼升级选项
- [ ] 添加多人合作模式

---

## 10. 开发规范

### 10.1 代码风格
- 使用 TypeScript 严格模式
- 文件长度 < 800 行
- 函数长度 < 50 行
- 使用不可变数据模式

### 10.2 提交规范
```
<type>: <description>

<body>

co-authored-by: ...
```

type: feat, fix, refactor, docs, test, chore, perf, ci

---

## 附录

### A. 配置文件示例
```typescript
// towers.ts 示例
export const TOWERS: Record<string, TowerConfig> = {
  pistol: {
    key: 'pistol',
    name: '手枪塔',
    cost: 50,
    range: 150,
    damage: 10,
    fireRate: 500,
    color: 0x4682B4
  }
  // ...
};
```

### B. 场景切换图
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Boot   │───→│  Menu   │───→│  Game   │───→│GameOver │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                    │
                                    ↓
                              ┌─────────┐
                              │ Restart │
                              └─────────┘
```
