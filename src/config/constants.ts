export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 32,
  MAX_LIVES: 10,
  STARTING_MONEY: 300
};

// Grid configuration for pathfinding (Level 5 smart enemies)
export const GRID_CONFIG = {
  CELL_SIZE: 40,      // Size of each grid cell
  MAP_WIDTH: 800,     // Game map width
  MAP_HEIGHT: 600,    // Game map height
  MAX_ITERATIONS: 500 // Max pathfinding iterations to prevent lag
};

// Obstacle types for pathfinding
export enum ObstacleType {
  EMPTY = 0,
  TOWER = 1,
  FENCE = 2
}

export const PATH_POINTS = [
  { x: 0, y: 150 },
  { x: 200, y: 150 },
  { x: 200, y: 400 },
  { x: 500, y: 400 },
  { x: 500, y: 200 },
  { x: 700, y: 200 },
  { x: 700, y: 500 },
  { x: 780, y: 500 }
];
