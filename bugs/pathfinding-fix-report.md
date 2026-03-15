# 寻路卡住问题修复报告

## 问题描述
当动物（SmartEnemy）移动到两座塔中间的狭窄通道时，会被卡住无法继续移动。

## 根本原因分析

### 问题1: 强制最小阻挡半径
**位置**: `src/utils/Pathfinding.ts:54`

```typescript
// 旧代码 - 强制最小半径为 2 格
const radiusCells = Math.max(2, Math.ceil((obs.radius + 10) / GRID_CONFIG.CELL_SIZE));
```

**问题**:
- `Math.max(2, ...)` 强制阻挡半径至少为 2 个网格单元
- 即使塔很小，也会占用 2×2 = 4 个网格单元
- 加上额外的 10 像素缓冲，导致阻挡范围过大

**实际计算**:
- CELL_SIZE = 40 像素
- 塔半径 = 40 像素（硬编码）
- 计算: `Math.ceil((40 + 10) / 40) = 2`
- 强制: `Math.max(2, 2) = 2`
- 阻挡范围: 2×2 网格 = 80×80 像素

### 问题2: 硬编码的塔半径
**位置**: `src/game/GameScene.ts:752`

```typescript
// 旧代码 - 硬编码半径 40 像素
() => this.towerManager.getTowers().map(t => ({ x: t.x, y: t.y, radius: 40 }))
```

**问题**:
- 塔的实际基座大小是 32×32 像素（见 Tower.ts:32）
- 半径应该是 16 像素，但硬编码为 40 像素
- 导致阻挡范围比实际碰撞体积大很多

## 修复方案

### 修复1: 移除强制最小半径
**文件**: `src/utils/Pathfinding.ts`

```typescript
// 新代码 - 根据实际半径计算，使用小缓冲
const radiusCells = Math.ceil((obs.radius + 5) / GRID_CONFIG.CELL_SIZE);
```

**改进**:
- 移除 `Math.max(2, ...)` 强制最小值
- 减少缓冲从 10 像素到 5 像素
- 阻挡范围更精确，避免通道被完全堵死

### 修复2: 使用正确的塔半径
**文件**: `src/game/GameScene.ts`

```typescript
// 新代码 - 使用实际塔半径 (16px + 小缓冲)
() => this.towerManager.getTowers().map(t => ({ x: t.x, y: t.y, radius: 20 }))
```

**改进**:
- 塔基座 32×32 像素，半径 = 16 像素
- 加上 4 像素缓冲，总共 20 像素
- 更符合实际碰撞体积

## 验证测试

### 测试场景
1. 在狭窄通道（宽度约 100-150 像素）放置两座塔
2. 派出 SmartEnemy 尝试通过
3. 观察是否能找到路径绕过塔

### 预期结果
- ✅ SmartEnemy 能够成功寻路通过狭窄通道
- ✅ 不会在两座塔之间卡住
- ✅ 路径合理，紧贴塔边缘移动

## 技术细节

### 网格计算
```
CELL_SIZE = 40 像素
旧半径 = 40 + 10 = 50 像素 → 阻挡 2 格 = 80 像素
新半径 = 20 + 5 = 25 像素 → 阻挡 1 格 = 40 像素
```

### 影响范围
- 仅影响 Level 5+ 的 SmartEnemy 寻路
- 不影响普通敌人的路径移动
- 不影响塔的攻击逻辑

## 相关文件
- `src/utils/Pathfinding.ts` - A* 寻路算法
- `src/game/GameScene.ts` - 塔半径配置
- `src/entities/SmartEnemy.ts` - 智能敌人实现
- `src/config/constants.ts` - 网格配置