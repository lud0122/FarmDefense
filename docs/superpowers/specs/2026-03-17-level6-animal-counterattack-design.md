# FarmDefense 第6关设计规格：动物反击（拆塔行为）

日期：2026-03-17
状态：已评审（待用户最终审阅）

## 1. 背景与目标

在保留现有第1-5关玩法的前提下，新增第6关，使敌人从“只冲终点”进化为“具备攻击能力并可拆塔”。本关采用混编行为：

- 30% 敌人：直冲终点（Rush）
- 70% 敌人：优先攻击塔（TowerBreaker）

核心目标：

1. 形成“敌人会拆塔”的新威胁层级；
2. 不破坏既有关卡逻辑与数据结构；
3. 为后续扩展更多敌人 AI 行为打下可扩展基础。

## 2. 已确认需求

1. 新增第6关（不改现有第5关）。
2. 拆塔规则为“接触即攻击”，非远程攻击。
2. 同类型敌人内混编行为（每批按固定配额并洗牌分配，不是按类型固定）。
4. 混编比例固定为 30% 直冲 / 70% 拆塔。
5. 塔有生命值，血量归零后直接摧毁。

## 3. 总体方案（推荐实施）

采用“敌人本体 + 行为策略层”架构：

- 敌人本体（Enemy / SmartEnemy）负责：血量、受伤、视觉、基础移动能力；
- 行为策略（Behavior）负责：目标选择与决策（冲线 or 拆塔）；
- EnemyManager 负责：第6关生成时的行为分配与上下文注入。

该方案可避免把行为分支硬塞进 Enemy 类，降低后续 AI 扩展成本。

## 4. 架构设计

### 4.1 新增行为策略接口

新增行为抽象（示意）：

- `update(enemy, context, delta): void`
- `getType(): 'rush' | 'towerBreaker'`

`context` 包含：

- 获取当前塔列表的方法；
- 关卡终点信息；
- 可选的寻路/障碍能力（供 SmartEnemy 使用）。

### 4.2 策略实现

1. `RushBehavior`
   - 目标：持续推进到终点；
   - 语义：保持现有“冲线敌人”体验。

2. `TowerBreakerBehavior`
   - 优先目标：最近可用塔；
   - 进入接触距离后停止位移并按攻击间隔造成伤害；
   - 目标塔被摧毁后重选目标；
   - 若场上无塔，自动回退为冲终点行为。

### 4.3 塔生命系统

在 Tower 上增加生命能力：

- `maxHealth/currentHealth`
- `takeDamage(amount)`
- `isDestroyed()`

当塔生命归零时，由 TowerManager 统一移除，避免跨系统直接操作容器数组。

### 4.4 生成分配逻辑

在 `EnemyManager.spawnWave()` 对第6关每个批次按“固定配额”分配策略，而非纯概率抽样：

1. 对每个批次先得到 `totalCount`；
2. 计算 `rushCount = Math.round(totalCount * 0.3)`；
3. `towerBreakerCount = totalCount - rushCount`；
4. 生成长度为 `totalCount` 的行为数组（含 `rushCount` 个 rush、其余为 towerBreaker）；
5. 对行为数组做一次洗牌后按顺序绑定到生成个体。

这样可保证每个批次都严格满足 30/70 配额（仅受四舍五入影响），避免小样本显著偏差。

## 5. 数据流设计

### 5.1 主循环

`GameScene.update()`
→ `EnemyManager.update(time, delta)`
→ `enemy.behavior.update(...)`
→ 行为决定“移动 / 攻击塔”。

### 5.2 拆塔战斗流程

1. 获取可用塔列表；
2. 选择最近塔作为目标；
3. 移动至接触阈值；
4. 进入近战攻击循环（受攻击冷却控制）；
5. 目标塔摧毁后回到步骤1；
6. 若无塔可选，则推进终点。

### 5.3 攻击参数

为敌人配置新增字段（第6关使用）：

- `attackDamage?: number`（单位：每次命中造成的生命值伤害）
- `attackCooldown?: number`（单位：毫秒，基于 `delta` 累加判定是否可再次攻击）
- `attackRange?: number`（单位：世界坐标像素距离，当前用于近战接触阈值，预留远程扩展）

兼容性约束：

1. 三个字段均为**可选字段**；
2. 对未配置的旧敌人使用默认值：`attackDamage = 0`、`attackCooldown = Number.POSITIVE_INFINITY`、`attackRange = 0`；
3. 仅当敌人被分配为 TowerBreaker 行为时才读取攻击字段。

第6关推荐取值区间（用于数值平衡起点）：

- `attackDamage`: 5 ~ 25
- `attackCooldown`: 500 ~ 1400
- `attackRange`: 18 ~ 36

这样可通过配置调难度，同时不影响第1-5关已有敌人配置。

## 6. 关卡设计（第6关）

新增第6关（建议名称：`动物反击`），总体节奏：

- 前段：低压教学，玩家感知“敌人会打塔”；
- 中段：拆塔怪密度提升，迫使玩家重视前排与补位；
- 后段：高压混编，突出70%拆塔倾向。

关卡配置沿用现有 `LEVELS` 结构，不新增特殊入口。菜单自动展示。

## 7. 异常与鲁棒性

1. 目标塔并发失效：每帧校验 `targetTower.active`，失效立刻重选。
2. 无塔场景：TowerBreaker 自动转冲线，不会停滞。
3. UI 引用悬空：采用明确联动链路：`Tower.takeDamage()` 仅更新生命并在归零时发出 `destroyed` 信号（事件或销毁标记），`TowerManager` 统一执行 `removeTower(tower)`；随后由 `TowerManager` 回调/事件通知 `GameScene`，若 `selectedTower === tower` 则执行 `hideTowerRecycleMenu()`。
4. 性能保护：目标重选采用小间隔节流（150~250ms），避免每帧全量扫描。

## 8. 测试设计

### 8.1 单元测试

1. 单波次/单批次行为分配严格符合 30:70 配额（`rushCount = round(total*0.3)`，其余为拆塔）；
2. TowerBreaker 目标选择为最近塔；
3. 攻击冷却生效（非每帧掉血）；
4. 塔生命归零后被 TowerManager 移除。

### 8.2 集成测试

1. 第6关波次可完整开始/结束；
2. 拆塔怪可连续拆多座塔并继续决策；
3. 塔被摧毁后，其他系统（发射物、UI、波次检测）正常。

### 8.3 手动回归

1. 桌面与移动端均可正常交互；
2. 长按回收与敌方拆塔并发不报错；
3. 菜单可进入第6关并正常游玩。

## 9. 预计改动文件

- `src/config/enemies.ts`（敌人攻击配置）
- `src/config/levels.ts`（新增第6关）
- `src/entities/Tower.ts`（塔生命）
- `src/entities/Enemy.ts`（行为挂接）
- `src/entities/SmartEnemy.ts`（行为挂接）
- `src/systems/EnemyManager.ts`（行为分配与更新）
- `src/game/GameScene.ts`（塔摧毁 UI 联动）
- `src/entities/behaviors/*`（新增行为策略实现）

## 10. 非目标（本次不做）

1. 不引入远程敌人攻击形态；
2. 不重构旧关卡平衡；
3. 不改动整体 UI 视觉风格。

## 11. 验收标准

满足以下即视为通过：

1. 主线新增第6关且可从菜单进入；
2. 第6关敌人行为混编比例符合 30%/70% 目标；
3. 拆塔敌人可接触攻击并摧毁塔；
4. 塔摧毁后系统稳定，无崩溃、无明显逻辑卡死；
5. 旧关卡（1-5）玩法不受破坏。
