/**
 * A* Pathfinding implementation for SmartEnemy AI
 * Grid-based navigation that avoids towers and obstacles
 */

import { GRID_CONFIG } from '../config/constants';

interface GridNode {
  x: number;      // Grid coordinates
  y: number;
  g: number;      // Cost from start
  h: number;      // Heuristic to end
  f: number;      // Total cost (g + h)
  parent?: GridNode;
  walkable: boolean;
}

export class Pathfinding {
  private grid!: GridNode[][];
  private cols: number;
  private rows: number;

  constructor() {
    this.cols = Math.ceil(GRID_CONFIG.MAP_WIDTH / GRID_CONFIG.CELL_SIZE);
    this.rows = Math.ceil(GRID_CONFIG.MAP_HEIGHT / GRID_CONFIG.CELL_SIZE);
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = {
          x, y,
          g: 0, h: 0, f: 0,
          walkable: true
        };
      }
    }
  }

  /**
   * Mark tower positions as obstacles
   * Towers are impassable - enemies must navigate around them
   */
  public setObstacles(obstacles: Array<{ x: number; y: number; radius: number }>): void {
    this.initializeGrid();

    for (const obs of obstacles) {
      const gridX = Math.floor(obs.x / GRID_CONFIG.CELL_SIZE);
      const gridY = Math.floor(obs.y / GRID_CONFIG.CELL_SIZE);
      // Larger buffer to ensure towers are fully blocked
      const radiusCells = Math.max(2, Math.ceil((obs.radius + 10) / GRID_CONFIG.CELL_SIZE));

      for (let y = gridY - radiusCells; y <= gridY + radiusCells; y++) {
        for (let x = gridX - radiusCells; x <= gridX + radiusCells; x++) {
          if (this.isValidCell(x, y)) {
            const distance = Math.sqrt((x - gridX) ** 2 + (y - gridY) ** 2);
            if (distance <= radiusCells) {
              this.grid[y][x].walkable = false;
            }
          }
        }
      }
    }
  }

  /**
   * Find path from start to target using A*
   */
  public findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): Array<{ x: number; y: number }> | null {
    const startNode = this.getNodeAt(startX, startY);
    const endNode = this.getNodeAt(targetX, targetY);

    if (!startNode || !endNode || !endNode.walkable) {
      return null;
    }

    const openList: GridNode[] = [startNode];
    const closedList: Set<GridNode> = new Set();
    let iterations = 0;

    while (openList.length > 0 && iterations < GRID_CONFIG.MAX_ITERATIONS) {
      iterations++;

      // Find node with lowest f cost
      let currentNode = openList[0];
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < currentNode.f) {
          currentNode = openList[i];
          currentIndex = i;
        }
      }

      openList.splice(currentIndex, 1);
      closedList.add(currentNode);

      // Found target
      if (currentNode === endNode) {
        return this.reconstructPath(endNode);
      }

      // Check neighbors
      const neighbors = this.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        if (closedList.has(neighbor) || !neighbor.walkable) continue;

        const tentativeG = currentNode.g + this.getDistance(currentNode, neighbor);

        if (!openList.includes(neighbor) || tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.h = this.getDistance(neighbor, endNode);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;

          if (!openList.includes(neighbor)) {
            openList.push(neighbor);
          }
        }
      }
    }

    // No path found
    return null;
  }

  private getNodeAt(worldX: number, worldY: number): GridNode | null {
    const x = Math.floor(worldX / GRID_CONFIG.CELL_SIZE);
    const y = Math.floor(worldY / GRID_CONFIG.CELL_SIZE);
    if (!this.isValidCell(x, y)) return null;
    return this.grid[y][x];
  }

  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  private getNeighbors(node: GridNode): GridNode[] {
    const neighbors: GridNode[] = [];
    // Only 4-directional movement (no diagonals) to prevent clipping through towers
    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];

    for (const dir of directions) {
      const nx = node.x + dir.x;
      const ny = node.y + dir.y;
      if (this.isValidCell(nx, ny)) {
        neighbors.push(this.grid[ny][nx]);
      }
    }
    return neighbors;
  }

  private getDistance(a: GridNode, b: GridNode): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private reconstructPath(endNode: GridNode): Array<{ x: number; y: number }> {
    const path: Array<{ x: number; y: number }> = [];
    let current: GridNode | undefined = endNode;

    while (current) {
      path.unshift({
        x: current.x * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
        y: current.y * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
      });
      current = current.parent;
    }

    return path;
  }
}
