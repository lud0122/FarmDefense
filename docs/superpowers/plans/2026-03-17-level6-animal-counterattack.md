# Level 6 动物反击 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增第6关“动物反击”，实现敌人接触拆塔、每批次 30/70 固定配额混编（洗牌分配）、塔生命与统一摧毁联动，并保证第1-5关不回归。

**Architecture:** 采用“实体能力 + 行为策略”模式：Enemy/SmartEnemy 保留生命与移动能力，Rush/TowerBreaker 策略控制决策。GameScene 把关卡 `behaviorMix` 显式传给 EnemyManager；EnemyManager 按批次固定配额分配行为并在攻击参数无效时降级 Rush。Tower 仅发出 destroyed 信号，TowerManager 统一移除并通知 GameScene 做 UI 清理。

**Tech Stack:** TypeScript (strict), Phaser 3, Vitest

---

## File Map

### Create
- `src/entities/behaviors/EnemyBehavior.ts`
- `src/entities/behaviors/RushBehavior.ts`
- `src/entities/behaviors/TowerBreakerBehavior.ts`
- `src/utils/enemyBehaviorMix.ts`
- `src/utils/enemyAttackConfig.ts`
- `src/test/smoke.test.ts`
- `src/utils/__tests__/enemyBehaviorMix.test.ts`
- `src/utils/__tests__/enemyAttackConfig.test.ts`
- `src/entities/behaviors/__tests__/enemyBehavior.test.ts`
- `src/systems/__tests__/towerHealth.test.ts`
- `src/systems/__tests__/enemyManagerIntegration.test.ts`
- `src/game/__tests__/level6Flow.test.ts`

### Modify
- `package.json`
- `src/config/enemies.ts`
- `src/config/levels.ts`
- `src/entities/Enemy.ts`
- `src/entities/SmartEnemy.ts`
- `src/entities/Tower.ts`
- `src/systems/TowerManager.ts`
- `src/systems/EnemyManager.ts`
- `src/game/GameScene.ts`
- `src/game/MenuScene.ts`（仅当第6关按钮文案需要）

---

## Task 1: 建立可执行测试入口（Preflight）

**Files:**
- Modify: `package.json`
- Create: `src/test/smoke.test.ts`

- [ ] **Step 1: 安装 Vitest**
Run: `npm install -D vitest`

- [ ] **Step 2: 添加测试脚本**
在 `package.json` 增加：
- `"test": "vitest run"`
- `"test:watch": "vitest"`

- [ ] **Step 3: 新增 smoke 测试（绿）**
在 `src/test/smoke.test.ts` 写 `expect(1).toBe(1)`。

- [ ] **Step 4: 运行测试入口**
Run: `npm run test -- src/test/smoke.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json src/test/smoke.test.ts
git commit -m "chore: add vitest runner and smoke test"
```

---

## Task 2: 关卡契约扩展（Level 6 + behaviorMix + attack fields）

**Files:**
- Modify: `src/config/levels.ts`
- Modify: `src/config/enemies.ts`
- Modify: `src/utils/__tests__/enemyBehaviorMix.test.ts`

- [ ] **Step 1: 在 `enemyBehaviorMix.test.ts` 写失败断言（红）**
断言 Level 6 存在且 `behaviorMix` 为 0.3/0.7。

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/utils/__tests__/enemyBehaviorMix.test.ts`
Expected: FAIL

- [ ] **Step 3: 最小实现配置字段（绿）**
实现 `LevelConfig.behaviorMix?` 与 `EnemyConfig.attackDamage?/attackCooldown?/attackRange?`。

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/utils/__tests__/enemyBehaviorMix.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/config/levels.ts src/config/enemies.ts src/utils/__tests__/enemyBehaviorMix.test.ts
git commit -m "feat: add level6 mix contract and enemy attack fields"
```

---

## Task 3: 固定配额混编工具（30/70 + 洗牌）

**Files:**
- Create: `src/utils/enemyBehaviorMix.ts`
- Modify: `src/utils/__tests__/enemyBehaviorMix.test.ts`

- [ ] **Step 1: 写失败测试（红）**
覆盖 10=>3/7、7=>2/5、长度一致、洗牌计数不变。

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/utils/__tests__/enemyBehaviorMix.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 `buildFixedMix`**

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/utils/__tests__/enemyBehaviorMix.test.ts`
Expected: 部分 PASS

- [ ] **Step 5: 实现 `shuffleMix`（支持注入 rng）**

- [ ] **Step 6: 运行测试**
Run: `npm run test -- src/utils/__tests__/enemyBehaviorMix.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add src/utils/enemyBehaviorMix.ts src/utils/__tests__/enemyBehaviorMix.test.ts
git commit -m "feat: implement fixed-ratio enemy behavior mix"
```

---

## Task 4: 攻击参数解析与无效降级规则

**Files:**
- Create: `src/utils/enemyAttackConfig.ts`
- Create/Modify: `src/utils/__tests__/enemyAttackConfig.test.ts`

- [ ] **Step 1: 写失败测试（红）**
覆盖合法参数、无效参数、TowerBreaker 无效时 `fallbackRush=true`。

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/utils/__tests__/enemyAttackConfig.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现默认值解析**

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/utils/__tests__/enemyAttackConfig.test.ts`
Expected: 部分 PASS

- [ ] **Step 5: 实现有效性校验与降级标记**

- [ ] **Step 6: 运行测试**
Run: `npm run test -- src/utils/__tests__/enemyAttackConfig.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add src/utils/enemyAttackConfig.ts src/utils/__tests__/enemyAttackConfig.test.ts
git commit -m "feat: add attack config validation and rush fallback"
```

---

## Task 5: 行为接口与 Rush 行为

**Files:**
- Create: `src/entities/behaviors/EnemyBehavior.ts`
- Create: `src/entities/behaviors/RushBehavior.ts`
- Modify: `src/entities/behaviors/__tests__/enemyBehavior.test.ts`

- [ ] **Step 1: 在 `enemyBehavior.test.ts` 写 Rush 失败用例（红）**

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现接口**

- [ ] **Step 4: 实现 RushBehavior**

- [ ] **Step 5: 运行测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: Rush 用例 PASS

- [ ] **Step 6: Commit**
```bash
git add src/entities/behaviors/EnemyBehavior.ts src/entities/behaviors/RushBehavior.ts src/entities/behaviors/__tests__/enemyBehavior.test.ts
git commit -m "feat: add behavior interface and rush behavior"
```

---

## Task 6: TowerBreaker 行为（接触攻击）

**Files:**
- Create: `src/entities/behaviors/TowerBreakerBehavior.ts`
- Modify: `src/entities/behaviors/__tests__/enemyBehavior.test.ts`

- [ ] **Step 1: 写失败用例（最近塔、接触攻击、cooldown、失效重选、无塔回退）（红）**

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现目标选择与节流**

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: 部分 PASS

- [ ] **Step 5: 实现接触攻击 + cooldown**

- [ ] **Step 6: 运行测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: 部分 PASS

- [ ] **Step 7: 实现无塔回退 Rush**

- [ ] **Step 8: 运行测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**
```bash
git add src/entities/behaviors/TowerBreakerBehavior.ts src/entities/behaviors/__tests__/enemyBehavior.test.ts
git commit -m "feat: add tower-breaker behavior with contact attack"
```

---

## Task 7: 挂接 Enemy / SmartEnemy 到策略层

**Files:**
- Modify: `src/entities/Enemy.ts`
- Modify: `src/entities/SmartEnemy.ts`
- Modify: `src/entities/behaviors/__tests__/enemyBehavior.test.ts`

- [ ] **Step 1: 写失败用例（未设置策略兼容、设置策略后委托）（红）**

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: FAIL

- [ ] **Step 3: 挂接 Enemy.setBehavior + update 委托**

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: 部分 PASS

- [ ] **Step 5: 挂接 SmartEnemy.setBehavior + update 委托**

- [ ] **Step 6: 运行测试**
Run: `npm run test -- src/entities/behaviors/__tests__/enemyBehavior.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add src/entities/Enemy.ts src/entities/SmartEnemy.ts src/entities/behaviors/__tests__/enemyBehavior.test.ts
git commit -m "refactor: wire enemy entities to behavior strategies"
```

---

## Task 8: 塔生命与统一摧毁链路

**Files:**
- Modify: `src/entities/Tower.ts`
- Modify: `src/systems/TowerManager.ts`
- Modify: `src/systems/__tests__/towerHealth.test.ts`

- [ ] **Step 1: 在 `towerHealth.test.ts` 写失败用例（红）**

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/systems/__tests__/towerHealth.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 Tower 生命与 destroyed 信号**

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/systems/__tests__/towerHealth.test.ts`
Expected: 部分 PASS

- [ ] **Step 5: 实现 TowerManager 统一监听并 remove**

- [ ] **Step 6: 运行测试**
Run: `npm run test -- src/systems/__tests__/towerHealth.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add src/entities/Tower.ts src/systems/TowerManager.ts src/systems/__tests__/towerHealth.test.ts
git commit -m "feat: add tower hp and manager-driven destruction flow"
```

---

## Task 9: EnemyManager 集成（显式 mix + 固定配额 + 降级）

**Files:**
- Modify: `src/systems/EnemyManager.ts`
- Modify: `src/game/GameScene.ts`
- Modify: `src/systems/__tests__/enemyManagerIntegration.test.ts`

- [ ] **Step 1: 写失败用例（红）**
覆盖显式传参、固定配额分配、无效参数降级 Rush。

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/systems/__tests__/enemyManagerIntegration.test.ts`
Expected: FAIL

- [ ] **Step 3: 扩展 spawnWave 签名支持 mixConfig**

- [ ] **Step 4: 运行测试**
Run: `npm run test -- src/systems/__tests__/enemyManagerIntegration.test.ts`
Expected: 部分 PASS

- [ ] **Step 5: 集成 fixed mix + fallback + warning**

- [ ] **Step 6: 运行测试**
Run: `npm run test -- src/systems/__tests__/enemyManagerIntegration.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add src/systems/EnemyManager.ts src/game/GameScene.ts src/systems/__tests__/enemyManagerIntegration.test.ts
git commit -m "feat: integrate level mix config and fallback in enemy manager"
```

---

## Task 10: 第6关可玩性与 UI 清理联动

**Files:**
- Modify: `src/config/levels.ts`
- Modify: `src/game/GameScene.ts`
- Modify: `src/game/MenuScene.ts`（若仅需第6关展示）
- Modify: `src/game/__tests__/level6Flow.test.ts`

- [ ] **Step 1: 写自动化失败用例（红）**
覆盖：第6关可进入、拆塔怪可接触攻击、塔摧毁时选中菜单自动关闭。

- [ ] **Step 2: 运行失败测试**
Run: `npm run test -- src/game/__tests__/level6Flow.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现第6关波次与 UI 联动最小改动**

- [ ] **Step 4: 运行自动化测试**
Run: `npm run test -- src/game/__tests__/level6Flow.test.ts`
Expected: PASS

- [ ] **Step 5: 全量验证**
Run:
- `npm run test`
- `npx tsc --noEmit`
- `npm run build`
Expected: 全 PASS

- [ ] **Step 6: 手动回归清单**
- 菜单进入第6关
- 实机观察 30/70 混编体感
- 移动端长按回收与拆塔并发无报错

- [ ] **Step 7: Commit**
```bash
git add src/config/levels.ts src/game/GameScene.ts src/game/MenuScene.ts src/game/__tests__/level6Flow.test.ts
git commit -m "feat: add level6 animal counterattack and ui cleanup linkage"
```

---

## Final Acceptance Checklist

- [ ] 第6关可从菜单进入并完整游玩
- [ ] 每批次严格 30/70（四舍五入规则）
- [ ] TowerBreaker 为“接触即攻击”
- [ ] 攻击参数无效时立即降级 Rush（有 warning）
- [ ] 塔归零后由 TowerManager 统一移除并通知 GameScene 清理 UI
- [ ] 第1-5关无行为回归
