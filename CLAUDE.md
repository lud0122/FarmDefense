# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Farm Defender** - A tower defense game built with TypeScript and Phaser 3.70.

## Tech Stack

- **Language:** TypeScript (ES2020)
- **Game Engine:** Phaser 3.70
- **Build Tool:** Vite 5.x
- **Bundler:** ESBuild (via Vite)
- **Test Framework:** Vitest

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

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/test/smoke.test.ts
```

## Architecture

### Directory Structure

```
src/
├── main.ts                 # Game entry point, scene registration
├── config/                 # Game configuration (data-only)
│   ├── constants.ts        # Game-wide constants, path points
│   ├── enemies.ts          # Enemy type definitions
│   ├── towers.ts           # Tower type definitions
│   └── levels.ts           # Level/wave configurations
├── game/                   # Phaser scenes
│   ├── BootScene.ts        # Initialization, asset loading
│   ├── MenuScene.ts        # Main menu
│   ├── GameScene.ts        # Main gameplay scene
│   └── GameOverScene.ts    # Victory/defeat screen
├── entities/               # Game objects (extend Phaser)
│   ├── Enemy.ts            # Enemy with pathfinding
│   ├── SmartEnemy.ts       # Level 5+ pathfinding enemy
│   ├── Crop.ts             # Level 5 destructible crops
│   ├── Projectile.ts       # Projectile with homing
│   ├── Tower.ts            # Base tower class
│   ├── PlayerHelicopter.ts # Player-controlled helicopter
│   ├── behaviors/          # Enemy AI behaviors (Level 6+)
│   │   ├── EnemyBehavior.ts       # Behavior interface
│   │   ├── RushBehavior.ts        # Rush toward towers
│   │   └── TowerBreakerBehavior.ts # Target and attack towers
│   └── towers/             # Tower implementations
├── systems/                # Game logic systems
│   ├── EnemyManager.ts     # Enemy spawning & lifecycle
│   ├── TowerManager.ts     # Tower placement & targeting
│   ├── ProjectileManager.ts # Projectile lifecycle
│   ├── CropManager.ts      # Level 5 crop management
│   ├── EconomySystem.ts    # Money & economy
│   └── AudioSystem.ts      # Sound effects & BGM
├── ui/                     # UI components (mobile support)
│   ├── VirtualJoystick.ts  # Mobile virtual joystick
│   ├── MobileToolbar.ts    # Mobile action toolbar
│   └── MobileTowerPanel.ts # Mobile tower selection panel
├── utils/                  # Utility functions
│   ├── MobileDetect.ts     # Mobile device detection
│   └── Pathfinding.ts      # A* pathfinding for SmartEnemy
└── test/                   # Test files
    └── smoke.test.ts       # Basic sanity tests
```

### Core Design Patterns

**Manager Pattern:** All game entities are managed by dedicated manager classes that handle spawning, updates, and cleanup. This centralizes entity lifecycle management.

**Config-Driven Design:** All game balance values (enemy stats, tower stats, levels) are defined in `config/` as plain data objects. This separates data from logic.

**Scene-Based Architecture:** Uses Phaser Scenes for different game states:
- `BootScene` → `MenuScene` → `GameScene` → `GameOverScene`

**Entity-System Separation:**
- `entities/` = Data + visual representation (extends Phaser game objects)
- `systems/` = Game logic and coordination

**Behavior Pattern (Level 6+):** Enemy AI is modularized via behavior classes that implement `EnemyBehavior` interface. Each behavior controls enemy movement and actions independently.

### Level Progression System

The game features 6+ levels with increasing complexity:

- **Levels 1-3:** Traditional tower defense with path-following enemies
- **Level 4:** Boss encounters with special enemy types
- **Level 5:** Smart enemies with A* pathfinding that target crops instead of following fixed paths. Uses `SmartEnemy` and `Pathfinding` utility.
- **Level 6+:** Behavior-based enemies with different AI patterns (`rush`, `towerBreaker`). The `behaviorMix` config in `levels.ts` controls the ratio of each behavior type in waves.

### Mobile-First Design

The game supports both desktop and mobile platforms:

- **Device Detection:** `utils/MobileDetect.ts` uses User-Agent sniffing to detect mobile devices
- **Input Handling:** Desktop uses mouse/keyboard; mobile uses touch with virtual joystick
- **UI Adaptation:** `GameScene` conditionally initializes mobile UI components based on `isMobile()`
  - `VirtualJoystick` - Left side touch control for helicopter movement
  - `MobileToolbar` - Right side action buttons (cancel, range toggle)
  - `MobileTowerPanel` - Bottom tower selection panel optimized for touch
- **Tower Interaction:** Desktop uses right-click for recycle menu; mobile uses long-press (500ms)

### Key Data Flow

1. **Enemy Spawning:** `GameScene` → `EnemyManager.spawnWave()` → `EnemyManager.update()` → `Enemy` moves along `PATH_POINTS` (or uses pathfinding for SmartEnemy)
2. **Combat:** `TowerManager.update()` → creates `Projectile` → `ProjectileManager.update()` → `Enemy.takeDamage()`
3. **Economy:** `Enemy.onDeath` → `EconomySystem.addMoney()` → UI update
4. **Player Control:** Desktop uses WASD/Arrow keys; mobile uses `VirtualJoystick` → `PlayerHelicopter.setJoystickInput()`
5. **Smart Enemy Pathfinding (Level 5+):** `SmartEnemy.update()` → `Pathfinding.findPath()` → moves toward target crop
6. **Behavior-Based Enemies (Level 6+):** `EnemyManager.update()` → `behavior.update()` → behavior controls enemy movement/actions

### Important Conventions

- All managers receive the `Phaser.Scene` context in constructor
- Entity `update(time, delta)` follows Phaser's update loop signature
- Managers expose `clear()` for scene cleanup
- Tower types use factory pattern in `TowerManager.placeTower()` switch
- Mobile UI components emit events that `GameScene` listens to for coordination
- Level configs include `isSmartLevel` flag for Level 5+ pathfinding enemies
- Behavior configs include `behaviorMix` for Level 6+ behavior ratios

## Adding New Content

### New Enemy Type

1. Add config to `src/config/enemies.ts`
2. For Level 5+: set `isSmartLevel: true` in level config to use `SmartEnemy`
3. For Level 6+: add behavior config in `levels.ts` under `behaviorMix` field
4. No code changes needed for basic enemies - system is data-driven

### New Tower Type

1. Add config to `src/config/towers.ts`
2. Create `src/entities/towers/NewTower.ts` extending `Tower`
3. Add case in `TowerManager.placeTower()` switch

### New Level

1. Add config to `src/config/levels.ts`
2. For Level 5+: set `isSmartLevel: true` and ensure crops are placed via `CropManager`
3. For Level 6+: add `behaviorMix` config with behavior ratios
4. Update `GameScene.startNextWave()` to use level config

### New Enemy Behavior (Level 6+)

1. Create behavior class in `src/entities/behaviors/` implementing `EnemyBehavior` interface
2. Register behavior type in `EnemyBehaviorType` type union
3. Update `EnemyManager` to instantiate the behavior based on enemy config

## Testing

```bash
# Type check
npx tsc --noEmit

# Dev server (manual testing)
npm run dev

# Run unit tests
npm test
```

Test files are located in:
- `src/test/` - Smoke tests and integration tests
- `src/**/__tests__/` - Unit tests colocated with source files

## Deployment

The project uses GitHub Actions for automated deployment to GitHub Pages:

- Workflow file: `.github/workflows/deploy.yml`
- Triggered on push to `master` branch
- Builds with `npm run build` and deploys `dist/` folder
