# Farm Defender - 技术设计文档

## 1. 项目概述

### 1.1 游戏简介
**Farm Defender** 是一款基于 TypeScript + Phaser 3 开发的塔防游戏。玩家需要在农场上建造各种防御塔，抵御一波波来袭的野生动物，保护自己的农场。

### 1.2 技术栈
- **语言**: TypeScript (ES2020)
- **游戏引擎**: Phaser 3.70
- **构建工具**: Vite 5.x
- **打包器**: ESBuild
- **测试框架**: Vitest
- **部署**: GitHub Pages

---

## 2. 架构设计

### 2.1 目录结构

```
src/
├── main.ts                    # 游戏入口，场景注册
├── config/                    # 游戏配置（数据驱动）
│   ├── constants.ts           # 全局常量、路径点
│   ├── enemies.ts             # 敌人类型定义
│   ├── towers.ts              # 塔楼类型定义
│   └── levels.ts              # 关卡/波次配置
├── game/                      # Phaser 场景
│   ├── BootScene.ts           # 初始化、资源加载
│   ├── MenuScene.ts           # 主菜单
│   ├── GameScene.ts           # 主游戏场景
│   └── GameOverScene.ts       # 胜利/失败画面
├── entities/                  # 游戏实体（继承 Phaser）
│   ├── Enemy.ts               # 敌人基类
│   ├── SmartEnemy.ts          # Level 5+ A*寻路敌人
│   ├── Crop.ts                # Level 5 作物实体
│   ├── Projectile.ts          # 子弹基类
│   ├── Tower.ts               # 塔楼基类
│   ├── PlayerHelicopter.ts    # 玩家直升机
│   ├── behaviors/             # Level 6+ 敌人AI行为
│   │   ├── EnemyBehavior.ts   # 行为接口
│   │   ├── RushBehavior.ts    # 冲锋行为
│   │   └── TowerBreakerBehavior.ts # 破塔行为
│   └── towers/                # 具体塔楼实现
├── systems/                   # 游戏逻辑系统
│   ├── EnemyManager.ts        # 敌人生成与生命周期
│   ├── TowerManager.ts        # 塔楼放置与目标锁定
│   ├── ProjectileManager.ts   # 子弹生命周期
│   ├── CropManager.ts         # Level 5 作物管理
│   ├── EconomySystem.ts       # 金币经济系统
│   └── AudioSystem.ts         # 音效系统
├── ui/                        # UI组件（移动端适配）
│   ├── VirtualJoystick.ts     # 虚拟摇杆
│   ├── MobileToolbar.ts       # 移动端工具栏
│   └── MobileTowerPanel.ts    # 移动端塔楼面板
├── utils/                     # 工具函数
│   ├── MobileDetect.ts        # 移动端设备检测
│   └── Pathfinding.ts         # A*寻路算法
└── test/                      # 测试文件
    └── smoke.test.ts          # 基础测试
```

### 2.2 核心架构模式

#### Manager 模式
所有游戏实体都由专门的 Manager 类管理：
- **EnemyManager**: 负责敌人的生成、更新和销毁
- **TowerManager**: 负责塔楼的放置、升级和回收
- **ProjectileManager**: 负责子弹的创建、更新和销毁
- **CropManager**: 负责 Level 5 作物的生成和生存检测

#### Config-Driven Design
所有游戏平衡数据定义在 `config/` 目录：
- 敌人属性（生命值、速度、金币奖励、行为配置）
- 塔楼属性（成本、射程、伤害、攻击速度、生命值）
- 关卡配置（波次、敌人类型、行为混合比例）

#### Scene-Based Architecture
使用 Phaser Scenes 管理游戏状态：
```
BootScene → MenuScene → GameScene → GameOverScene
```

#### Behavior Pattern (Level 6+)
Level 6+ 引入行为模式，敌人AI通过实现 `EnemyBehavior` 接口的行为类来控制：
- **RushBehavior**: 冲向玩家塔楼进行自杀式攻击
- **TowerBreakerBehavior**: 识别近处塔楼并造成持续伤害

---

## 3. 核心系统详解

### 3.1 敌人系统 (EnemySystem)

#### 敌人行为流程
1. **生成**: EnemyManager 根据关卡配置生成敌人
2. **移动**: 基础敌人沿预定义路径点（PATH_POINTS）移动
3. **到达终点**: 扣除玩家生命值
4. **死亡**: 给予金币奖励

#### 智能敌人系统 (Level 5+)
**SmartEnemy**: 使用 A* 寻路算法，直接寻找路径攻击农场作物
- 不再沿固定路径移动
- 实时计算到最近作物的路线
- 优先攻击作物，造成游戏失败条件

#### 行为系统 (Level 6+)
**BehaviorMix配置**: 关卡配置可指定不同行为的比例
```typescript
interface LevelBehaviorMixConfig {
  rushRatio: number;        // 冲锋敌人比例
  towerBreakerRatio: number; // 破塔敌人比例
}
```

#### 路径系统
```typescript
const PATH_POINTS = [
  { x: 0, y: 300 },    // 起点（左侧）
  { x: 200, y: 300 },
  { x: 200, y: 100 },
  { x: 600, y: 100 },
  { x: 600, y: 500 },
  { x: 400, y: 500 },
  { x: 400, y: 300 },
  { x: 800, y: 300 }   // 终点（右侧）
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

### 3.2 作物系统 (CropSystem - Level 5+)

#### 设计目的
- 为 SmartEnemy 提供移动目标
- 增加游戏策略性（保护多个散点目标）
- 作物被毁会影响得分

#### 作物类型
| 作物 | 生命值 | 描述 |
|------|--------|---------|
| 小麦 (Wheat) | 50 | 初期作物 |
| 玉米 (Corn) | 80 | 成熟作物 |
| 南瓜 (Pumpkin) | 120 | 高生命值作物 |

#### CropManager 职责
- `placeCropGrid()`: 在地图指定区域生成作物网格
- `getCropPositions()`: 返回所有存活作物位置（供寻路使用）
- `hasCropsRemaining()`: 检查是否还有存活作物

### 3.3 塔楼系统 (TowerSystem)

#### 塔楼基类设计
```typescript
class Tower extends Phaser.GameObjects.Container {
  config: TowerConfig;           // 配置数据
  lastFireTime: number;          // 上次攻击时间
  rangeCircle: Graphics;         // 射程显示
  health: number;                // 生命值（可被破塔敌人攻击）
  findTarget(enemies): Enemy     // 目标查找
  fire(target): Projectile       // 发射子弹
  takeDamage(amount): void       // 受到伤害
}
```

#### 塔楼生命值系统 (Level 6+)
- 塔楼拥有生命值属性
- **towerBreaker** 行为敌人可造成持续伤害
- 塔楼被破坏后需要重新建造

#### 塔楼类型对比
| 塔楼 | 成本 | 射程 | 伤害 | 攻速 | 生命值 | 特殊效果 |
|------|------|------|------|------|--------|----------|
| 手枪塔 | 50 | 150 | 10 | 500ms | 100 | 基础单体 |
| 机枪塔 | 150 | 120 | 5 | 100ms | 120 | 高速连射 |
| 榴弹塔 | 200 | 100 | 30 | 1000ms | 150 | 范围伤害 |
| 冰冻塔 | 120 | 130 | 5 | 600ms | 80 | 减速50% |
| 电击塔 | 180 | 80 | 15 | 400ms | 100 | 连锁攻击 |
| 哨戒塔 | 80 | 200 | 8 | 800ms | 90 | 超长射程 |

#### 攻击范围预览
- 选中塔楼后，鼠标移动到游戏区域时自动显示攻击范围
- 显示为绿色半透明圆形区域
- 帮助玩家决策塔的最佳放置位置

### 3.4 子弹系统 (ProjectileSystem)

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
enemy.speed *= 0.5 // 持续2秒
```

### 3.5 经济系统 (EconomySystem)

#### 金币获取
- 击杀敌人：获得敌人配置的 reward 金币
- 回收塔楼：获得建造成本的 50%

#### 经济平衡
- 起始金币：500-1500（根据关卡）
- 塔楼成本：50-200 金币
- 击杀奖励：10-100 金币

### 3.6 玩家直升机系统

#### 控制方式
- **移动**: WASD 键（桌面端）或虚拟摇杆（移动端）
- **自动射击**: 范围内自动瞄准敌人
- **射程显示**: R 键切换

#### 属性
- 移动速度：200
- 攻击范围：200
- 攻击间隔：300ms
- 伤害：15

### 3.7 UI 系统（移动端适配）

#### 移动端特定组件
- **VirtualJoystick**: 左侧画面触控摇杆，控制直升机移动
- **MobileToolbar**: 右侧操作按钮（取消、射程切换）
- **MobileTowerPanel**: 底部塔楼选择面板，优化触摸体验

#### 交互适配
- 桌面端：右键点击塔楼返回回收菜单
- 移动端：长按塔楼 500ms 触发回收菜单

---

## 4. 关卡进阶设计

### 4.1 关卡特性演进

| 关卡 | 特性 | 难度重点 |
|------|------|----------|
| 1-3 | 传统塔防 | 基础学习 |
| 4 | Boss 战 | 高生命值敌人 |
| 5 | A*寻路敌人 + 作物目标 | 多线防御 |
| 6+ | 行为AI敌人 + 塔楼生命值 | 策略升级 |

### 4.2 Level 5: 智能敌人关卡

#### 设计特点
- `isSmartLevel: true` 开启智能敌人模式
- 敌人使用 A* 寻路算法
- 直接寻找田间作物作为攻击目标
- 不再沿固定路径行进

#### 技术实现
- **Pathfinding.ts**: 基于网格的 A* 寻路
- **SmartEnemy**: 继承 Enemy，使用寻路更新移动逻辑
- **CropManager**: 管理作物生成和状态
- **胜利条件**: 保护作物不被全毁，消灭所有敌人

### 4.3 Level 6+: 行为AI关卡

#### 设计特点
- `behaviorMix` 配置指定不同行为类型的比例
- 敌人在生成时被分配行为类
- 行为类控制敌人的更新逻辑

#### 行为类型
| 行为 | 特点 | 应对策略 |
|------|------|----------|
| rush | 冲向塔楼自杀攻击 | 冰冻塔减速 |
| towerBreaker | 持续伤害塔楼 | 分散塔楼布局 |

---

## 5. 数据流

### 5.1 敌人生成流程

**基础敌人 (Level 1-4)**:
```
GameScene.startNextWave()
    ↓
EnemyManager.spawnWave(enemyConfigs)
    ↓
EnemyManager.update() → Enemy.moveAlongPath()
```

**智能敌人 (Level 5+)**:
```
GameScene.startNextWave()
    ↓
EnemyManager.spawnWave(enemyConfigs) → 实例化 SmartEnemy
    ↓
EnemyManager.update()
    ↓
SmartEnemy.update() → Pathfinding.findPath() → 寻找最近作物
    ↓
移动到作物位置进行攻击
```

**行为敌人 (Level 6+)**:
```
GameScene.startNextWave()
    ↓
EnemyManager.spawnWave(enemyConfigs)
    ↓
根据 behaviorMix 分配行为类型
    ↓
EnemyManager.update()
    ↓
behavior.update(enemy, context)
    ↓
行为类控制敌人移动/攻击
```

### 5.2 战斗流程
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

### 5.3 塔楼生命值流程 (Level 6+)
```
TowerBreakerBehavior.update()
    ↓
检测范围内塔楼
    ↓
对塔楼造成持续伤害
    ↓
Tower.takeDamage() → health--
    ↓
health <= 0 → Tower.destroy()
```

### 5.4 塔楼放置流程
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

## 6. UI 系统

### 6.1 桌面端游戏界面布局
```
+----------------------------------------------------------+
| ❤️ Lives  💰 Gold  Wave X                                |
|----------------------------------------------------------|
|                                                          |
|  游戏区域                                                |
|  (包含路径、塔楼、敌人、作物)                            |
|                                                          |
|----------------------------------------------------------|
| [塔1] [塔2] [塔3] [塔4] [塔5] [塔6]                      |
| $50   $150  $200  $120  $180  $80                        |
+----------------------------------------------------------+
```

### 6.2 交互设计
- **左键点击塔楼按钮**: 选中/取消选中
- **左键点击地图**: 放置塔楼
- **右键点击塔楼**: 显示回收菜单（桌面端）
- **长按塔楼**: 触发回收菜单（移动端，500ms）
- **数字键 1-6**: 快速选择塔楼
- **ESC 键**: 取消当前选择

---

## 7. 关卡设计

### 7.1 关卡配置结构
```typescript
interface LevelConfig {
  number: number;                    // 关卡编号
  name: string;                      // 关卡名称
  startingMoney: number;             // 起始金币
  maxLives: number;                  // 最大生命值
  waves: WaveConfig[][];            // 波次配置
  isSmartLevel?: boolean;           // Level 5+: 启用SmartEnemy
  behaviorMix?: LevelBehaviorMixConfig; // Level 6+: 行为混合配置
}

interface WaveConfig {
  enemyKey: string;                  // 敌人类型
  count: number;                     // 敌人数量
  interval: number;                  // 生成间隔(ms)
}

interface LevelBehaviorMixConfig {
  rushRatio: number;               // 冲锋行为比例
  towerBreakerRatio: number;       // 破塔行为比例
}
```

### 7.2 关卡难度曲线
| 关卡 | 起始金币 | 生命值 | 敌人种类 | 特殊机制 | 难度特点 |
|------|----------|--------|----------|----------|----------|
| 1 | 500 | 20 | 兔、野猪、狐狸 | - | 入门教学 |
| 2 | 800 | 20 | 加入老鹰 | - | 空中威胁 |
| 3 | 1000 | 25 | 加入熊Boss | - | Boss战 |
| 4 | 1500 | 30 | 全部敌人 | - | 极限挑战 |
| 5 | 1200 | 25 | 全部 | SmartEnemy + 作物系统 | 多线防御 |
| 6+ | 1500+ | 30 | 全部 | BehaviorMix + 塔楼生命值 | 策略升级 |

---

## 8. 性能优化

### 8.1 A* 寻路优化
- 网格化地图，预计算可行区域
- 缓存路径，避免每帧重新计算
- 设置寻路频率限制（每500ms更新一次）

### 8.2 性能指标
- 目标帧率: 60 FPS
- 最大敌人数量: 100+
- 最大塔楼数量: 50+
- 内存占用: < 100MB

---

## 9. 扩展性设计

### 9.1 添加新敌人类型

**基础敌人 (Level 1-4)**:
1. 在 `src/config/enemies.ts` 添加配置
2. 系统会自动支持，无需代码修改

**智能敌人 (Level 5+)**:
1. 在关卡配置中设置 `isSmartLevel: true`
2. 确保 `CropManager` 正确初始化作物
3. 在敌人配置中指定该关卡使用的敌人类型

**行为敌人 (Level 6+)**:
1. 在 `src/entities/behaviors/` 创建新行为类，实现 `EnemyBehavior` 接口
2. 在 `EnemyBehaviorType` 添加新行为类型
3. 在 `src/config/levels.ts` 配置 `behaviorMix`
4. 在 `EnemyManager` 中添加行为实例化逻辑

### 9.2 添加新塔楼类型
1. 在 `src/config/towers.ts` 添加配置
2. 创建 `src/entities/towers/NewTower.ts`
3. 继承 `Tower` 类，实现 `fire()` 方法
4. 在 `TowerManager.placeTower()` 添加 case
5. 可在配置中指定 `health` 属性

### 9.3 添加新关卡

**传统关卡 (Level 1-4)**:
1. 在 `src/config/levels.ts` 添加配置
2. 检查波次配置

**智能关卡 (Level 5)**:
1. 在 `src/config/levels.ts` 添加配置
2. 设置 `isSmartLevel: true`
3. 确保 `GameScene` 初始化时调用 `cropManager.placeCropGrid()`
4. 配置胜利条件（作物被毁/敌人全灭）

**行为关卡 (Level 6+)**:
1. 在 `src/config/levels.ts` 添加配置
2. 添加 `behaviorMix` 配置
3. 设置敌人具体行为比例
4. 如需，更新 `EnemyManager` 以支持新行为

---

## 10. 技术债务与改进计划

### 10.1 已完成特性
- [x] 大型波次时性能优化
- [x] 移动端适配（虚拟摇杆 + 触控UI）
- [x] Level 5: 智能敌人 + A* 寻路系统
- [x] Level 5: 作物保护目标系统
- [x] Level 6+: 行为AI系统
- [x] Level 6+: 塔楼生命值系统
- [x] 音效系统完善
- [x] 测试框架 Vitest

### 10.2 未来改进
- [ ] 添加存档功能
- [ ] 添加成就系统
- [ ] 添加更多塔楼升级选项
- [ ] 添加多人合作模式

---

## 11. 开发规范

### 11.1 代码风格
- 使用 TypeScript 严格模式
- 文件长度 < 800 行
- 函数长度 < 50 行
- 使用不可变数据模式

### 11.2 测试规范
- 使用 Vitest 进行单元测试
- 测试文件放在 `src/**/__tests__/` 或 `src/test/`
- 运行测试: `npm test`

### 11.3 提交规范
```
<type>: <description>

<body>

co-authored-by: ...
```

type: feat, fix, refactor, docs, test, chore, perf, ci

---

## 附录

### A. 配置文件示例

**塔楼配置** (`src/config/towers.ts`):
```typescript
export const TOWERS: Record<string, TowerConfig> = {
  pistol: {
    key: 'pistol',
    name: '手枪塔',
    cost: 50,
    range: 150,
    damage: 10,
    fireRate: 500,
    health: 100,    // Level 6+ 将会使用
    color: 0x4682B4
  }
  // ...
};
```

**关卡配置** (`src/config/levels.ts`):
```typescript
export const LEVELS: LevelConfig[] = [
  {
    number: 5,
    name: 'Level 5',
    startingMoney: 1200,
    maxLives: 25,
    isSmartLevel: true,  // 启用 SmartEnemy
    behaviorMix: {        // Level 6+ 行为配置
      rushRatio: 0.4,
      towerBreakerRatio: 0.6
    },
    waves: [/* ... */]
  }
];
```

### B. 场景切换图
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Boot   ├───→│  Menu   ├───→│  Game   ├───→│GameOver │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                     │
                                     ↓
                               ┌─────────┐
                               │ Restart │
                               └─────────┘
```

### C. 命令速查

```bash
# 开发
npm run dev

# 构建
npm run build

# 类型检查
npx tsc --noEmit

# 测试
npm test

# 预览
npm run preview
```
