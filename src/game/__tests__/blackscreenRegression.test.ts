import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../../..');

const readSource = (relativePath: string): string => {
  const absolutePath = resolve(projectRoot, relativePath);
  return readFileSync(absolutePath, 'utf-8');
};

describe('blackscreen regression', () => {
  it('does not preload removed sprite assets in BootScene', () => {
    const bootSceneSource = readSource('src/game/BootScene.ts');

    expect(bootSceneSource).not.toMatch(/load\.image\(\s*['"]ground['"]/);
    expect(bootSceneSource).not.toMatch(/load\.image\(\s*['"]tower-base['"]/);
  });

  it('initializes ProjectileManager in GameScene.create', () => {
    const gameSceneSource = readSource('src/game/GameScene.ts');

    expect(gameSceneSource).toMatch(/this\.projectileManager\s*=\s*new ProjectileManager\(this\)/);
  });
});
