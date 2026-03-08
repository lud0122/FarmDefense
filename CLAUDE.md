# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Farm Defender** - A tower defense game built with TypeScript and Phaser 3.70.

## Tech Stack

- **Language:** TypeScript (ES2020)
- **Game Engine:** Phaser 3.70
- **Build Tool:** Vite 5.x
- **Bundler:** ESBuild (via Vite)

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Type check only (no bundling)
npx tsc --noEmit

# Preview production build
npm run preview
```

## Architecture

### Directory Structure
```
src/
├── main.ts              # Game entry point, scene registration
├── config/              # Game configuration (data-only)
│   ├── constants.ts     # Game-wide constants, path points
│   ├── enemies.ts       # Enemy type definitions
│   ├── towers.ts        # Tower type definitions
│   └── levels.ts        # Level/wave configurations
├── game/                # Phaser scenes
│   ├── BootScene.ts     # Initialization, asset loading
│   ├── MenuScene.ts     # Main menu
│   ├── GameScene.ts     # Main gameplay
│   └── GameOverScene.ts # Victory/defeat screen
├── entities/            # Game objects (extend Phaser)
│   ├── Enemy.ts         # Enemy class with pathfinding
│   ├── Projectile.ts    # Projectile with homing
│   └── towers/          # Tower implementations
│       ├── PistolTower.ts
│       └── MachineGunTower.ts
└── systems/             # Game logic systems
    ├── EnemyManager.ts  # Enemy spawning & lifecycle
    ├── TowerManager.ts  # Tower placement & targeting
    ├── ProjectileManager.ts # Projectile lifecycle
    └── EconomySystem.ts # Money & economy
```

### Core Design Patterns

**Manager Pattern:** All game entities are managed by dedicated manager classes that handle spawning, updates, and cleanup. This centralizes entity lifecycle management.

**Config-Driven Design:** All game balance values (enemy stats, tower stats, levels) are defined in `config/` as plain data objects. This separates data from logic.

**Scene-Based Architecture:** Uses Phaser Scenes for different game states:
- `BootScene` → `MenuScene` → `GameScene` → `GameOverScene`

**Entity-System Separation:**
- `entities/` = Data + visual representation (extends Phaser game objects)
- `systems/` = Game logic and coordination

### Key Data Flow

1. **Enemy Spawning:** `GameScene` → `EnemyManager.spawnWave()` → `EnemyManager.update()` → `Enemy` moves along `PATH_POINTS`
2. **Combat:** `TowerManager.update()` → creates `Projectile` → `ProjectileManager.update()` → `Enemy.takeDamage()`
3. **Economy:** `Enemy.onDeath` → `EconomySystem.addMoney()` → UI update

### Important Conventions

- All managers receive the `Phaser.Scene` context in constructor
- Entity `update(time, delta)` follows Phaser's update loop signature
- Managers expose `clear()` for scene cleanup
- Tower types use factory pattern in `TowerManager.placeTower()`

## Adding New Content

### New Enemy Type
1. Add config to `src/config/enemies.ts`
2. No code changes needed - system is data-driven

### New Tower Type
1. Add config to `src/config/towers.ts`
2. Create `src/entities/towers/NewTower.ts` extending `Tower`
3. Add case in `TowerManager.placeTower()` switch

### New Level
1. Add config to `src/config/levels.ts`
2. Update `GameScene.startNextWave()` to use level config

## Testing

```bash
# Type check
npx tsc --noEmit

# Dev server (manual testing)
npm run dev
```
