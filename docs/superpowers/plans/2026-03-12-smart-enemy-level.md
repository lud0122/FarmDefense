# Level 5 "智慧农场" Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement "智慧农场" (Level 5) where enemies have evolved intelligence - they no longer follow fixed paths but roam freely across the farm to destroy crops, requiring new strategic gameplay.

**Architecture:** Create a new `SmartEnemy` class with AI-driven movement using A* pathfinding and crop-targeting behavior. Add `Crop` entities that enemies can destroy. Extend level system to support free-roaming enemy mode vs fixed path mode.

**Tech Stack:** TypeScript, Phaser 3, A* pathfinding algorithm

---

## Chunk 1: Smart Enemy System Core

### Task 1: Create Pathfinding Utility Module

**Files:**
- Create: `src/utils/Pathfinding.ts`
- Modify: `src/config/constants.ts`

**Purpose:** Implement A* pathfinding for smart enemies to navigate around towers and find optimal paths to crops.

- [ ] **Step 1: Add grid configuration to constants**

Add to `src/config/constants.ts`:
```typescript
// Grid configuration for pathfinding
export const GRID_CONFIG = {
  CELL_SIZE: 40,     // Size of each grid cell
  MAP_WIDTH: 800,    // Game map width
  MAP_HEIGHT: 600,   // Game map height
  MAX_ITERATIONS: 500 // Max pathfinding iterations to prevent lag
};

// Obstacle types for pathfinding
export enum ObstacleType {
  EMPTY = 0,
  TOWER = 1,
  FENCE = 2  // Indestructible obstacles
};
```

- [ ] **Step 2: Run type check**
```bash
npx tsc --noEmit
```
Expected: PASS

- [ ] **Step 3: Create Pathfinding utility**

Create `src/utils/Pathfinding.ts`
(Code provided in full in plan document)

- [ ] **Step 4: Test pathfinding logic**
```bash
npx tsc --noEmit --skipLibCheck
```
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/utils/Pathfinding.ts src/config/constants.ts
git commit -m "feat: add A* pathfinding utility for smart enemy AI"
```

---

### Task 2: Create SmartEnemy Class

**Files:**
- Create: `src/entities/SmartEnemy.ts`

**Purpose:** New enemy type with AI-driven movement, crop targeting, and dynamic pathfinding.

- [ ] **Step 1: Create SmartEnemy class**

Create `src/entities/SmartEnemy.ts`
(Full implementation with AI state machine)

- [ ] **Step 2: Run type check**
```bash
npx tsc --noEmit
```
Expected: PASS

- [ ] **Step 3: Commit**
```bash
git add src/entities/SmartEnemy.ts
git commit -m "feat: add SmartEnemy with A* pathfinding and crop targeting"
```

---

## Chunk 2: Crop System

### Task 3: Create Crop Entity Class

**Files:**
- Create: `src/entities/Crop.ts`

**Purpose:** Crops that enemies can destroy in Level 5, creating a defense objective.

- [ ] **Step 1: Create Crop class**
- [ ] **Step 2: Run type check**
- [ ] **Step 3: Commit**

---

### Task 4: Create CropManager System

**Files:**
- Create: `src/systems/CropManager.ts`

**Purpose:** Manage all crops in Level 5, handle crop placement and destruction tracking.

---

## Chunk 3: Level 5 Configuration

### Task 5: Add Level 5 Configuration

**Files:**
- Modify: `src/config/levels.ts`
- Modify: `src/config/enemies.ts`

---

## Chunk 4: Integration

### Task 6: Update EnemyManager
**Files:** `src/systems/EnemyManager.ts`

### Task 7: Update GameScene
**Files:** `src/game/GameScene.ts`

### Task 8: Final Integration Test
- Build and verify

---

## Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| `src/utils/Pathfinding.ts` | Create | A* pathfinding algorithm |
| `src/entities/SmartEnemy.ts` | Create | AI-driven enemy class |
| `src/entities/Crop.ts` | Create | Destructible crop entities |
| `src/systems/CropManager.ts` | Create | Crop lifecycle management |
| `src/systems/EnemyManager.ts` | Modify | Add smart enemy spawning |
| `src/config/levels.ts` | Modify | Level 5 configuration |
| `src/config/enemies.ts` | Modify | Smart enemy types |
| `src/game/GameScene.ts` | Modify | Integration logic |
| `src/config/constants.ts` | Modify | Grid configuration |
