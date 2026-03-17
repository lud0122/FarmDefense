import { test, expect } from '@playwright/test';

test.describe('关卡点击黑屏回归', () => {
  test('菜单进入关卡时不应出现资源加载失败错误', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.goto('http://localhost:3000/FarmDefense/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    await canvas.click({ position: { x: 200, y: 220 } });
    await page.waitForTimeout(1500);

    const assetErrors = consoleErrors.filter(error =>
      error.includes('Failed to process file') ||
      error.includes('ground') ||
      error.includes('tower-base')
    );

    expect(assetErrors).toEqual([]);
  });
});
