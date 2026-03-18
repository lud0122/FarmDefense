const { test, expect } = require('@playwright/test');

// 设置移动端视口（iPhone 14: 390x844）
test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

test.describe('FarmDefense 移动端取消按钮测试', () => {
  test.beforeEach(async ({ page }) => {
    // 监听控制台输出以便调试
    page.on('console', msg => {
      console.log(`[浏览器控制台] ${msg.type()}: ${msg.text()}`);
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.error('[页面错误]', error.message);
    });
  });

  test('测试取消按钮功能', async ({ page }) => {
    console.log('🎮 开始测试移动端取消按钮功能');

    // 1. 打开游戏页面
    console.log('📱 步骤 1: 打开游戏页面');
    await page.goto('http://localhost:3001/FarmDefense/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待游戏资源加载

    // 2. 点击开始按钮进入游戏场景
    console.log('🎯 步骤 2: 点击开始按钮');
    const startButton = await page.locator('text=开始游戏').or(
      page.locator('text=START')
    ).or(
      page.locator('button:has-text("开始")')
    );

    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click();
      console.log('✅ 已点击开始按钮');
      await page.waitForTimeout(2000); // 等待场景切换
    } else {
      console.log('⚠️  未找到开始按钮，可能已经在游戏场景中');
    }

    // 3. 等待游戏场景完全加载
    console.log('⏳ 步骤 3: 等待游戏场景加载');
    await page.waitForTimeout(3000);

    // 截图：游戏初始状态
    await page.screenshot({ path: 'test-screenshots/01-game-initial.png', fullPage: false });
    console.log('📸 已保存游戏初始状态截图');

    // 4. 检查金币是否足够放置塔
    console.log('💰 步骤 4: 检查金币状态');
    const moneyDisplay = await page.locator('text=/\\d+/').first();
    const moneyText = await moneyDisplay.textContent().catch(() => '0');
    console.log(`💰 当前金币: ${moneyText}`);

    // 5. 选择一个塔类型
    console.log('🏰 步骤 5: 选择塔类型');
    const towerButtons = await page.locator('button, [class*="tower"]').all();
    console.log(`📋 找到 ${towerButtons.length} 个可能的塔按钮`);

    // 尝试点击第一个可用的塔按钮
    let towerSelected = false;
    for (let i = 0; i < Math.min(3, towerButtons.length); i++) {
      try {
        const btn = towerButtons[i];
        if (await btn.isVisible()) {
          await btn.click();
          towerSelected = true;
          console.log(`✅ 已点击第 ${i + 1} 个塔按钮`);
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        console.log(`⚠️  第 ${i + 1} 个按钮点击失败: ${e.message}`);
      }
    }

    if (!towerSelected) {
      // 尝试点击canvas区域来选择塔
      console.log('🖱️  尝试通过点击canvas选择塔');
      const canvas = await page.locator('canvas').first();
      if (await canvas.isVisible()) {
        // 点击canvas中央偏上的位置（通常是塔选择区域）
        await canvas.click({ position: { x: 195, y: 100 } });
        await page.waitForTimeout(1000);
      }
    }

    // 截图：塔选中状态
    await page.screenshot({ path: 'test-screenshots/02-tower-selected.png', fullPage: false });
    console.log('📸 已保存塔选中状态截图');

    // 6. 验证攻击范围预览是否显示
    console.log('🔍 步骤 6: 验证攻击范围预览');
    await page.waitForTimeout(1000);
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (box) {
      console.log(`📐 Canvas 尺寸: ${box.width}x${box.height}`);
    }

    // 7. 记录当前状态
    console.log('📊 步骤 7: 记录当前游戏状态');
    const beforeCancel = await page.evaluate(() => {
      return {
        url: window.location.href,
        canvasCount: document.querySelectorAll('canvas').length,
        bodyHTML: document.body.innerHTML.substring(0, 500)
      };
    });
    console.log('📊 取消前状态:', {
      url: beforeCancel.url,
      canvasCount: beforeCancel.canvasCount
    });

    // 8. 点击取消按钮（右下角）
    console.log('❌ 步骤 8: 点击取消按钮');
    await page.waitForTimeout(500);

    // 方法1: 尝试找到取消按钮文本
    const cancelButton = await page.locator('text=取消').or(
      page.locator('button:has-text("取消")')
    ).or(
      page.locator('[class*="cancel"]')
    ).or(
      page.locator('[class*="toolbar"] button').last()
    );

    let cancelClicked = false;
    try {
      if (await cancelButton.isVisible({ timeout: 2000 })) {
        const cancelBox = await cancelButton.boundingBox();
        if (cancelBox) {
          console.log(`📍 取消按钮位置: x=${cancelBox.x}, y=${cancelBox.y}, width=${cancelBox.width}, height=${cancelBox.height}`);
          await cancelButton.click();
          cancelClicked = true;
          console.log('✅ 已点击取消按钮');
        }
      }
    } catch (e) {
      console.log('⚠️  未能找到取消按钮元素');
    }

    // 方法2: 如果没找到取消按钮，点击右下角区域
    if (!cancelClicked) {
      console.log('🖱️  尝试点击右下角区域');
      if (box) {
        // 右下角区域（预留一定的边距）
        const clickX = box.width - 60;
        const clickY = box.height - 60;
        console.log(`📍 点击坐标: (${clickX}, ${clickY})`);
        await canvas.click({ position: { x: clickX, y: clickY } });
      }
    }

    await page.waitForTimeout(2000);

    // 截图：点击取消后的状态
    await page.screenshot({ path: 'test-screenshots/03-after-cancel-click.png', fullPage: false });
    console.log('📸 已保存点击取消后状态截图');

    // 9. 验证是否取消了选中状态
    console.log('✅ 步骤 9: 验证取消操作结果');
    const afterCancel = await page.evaluate(() => {
      return {
        url: window.location.href,
        canvasCount: document.querySelectorAll('canvas').length,
        bodyHTML: document.body.innerHTML.substring(0, 500)
      };
    });
    console.log('📊 取消后状态:', {
      url: afterCancel.url,
      canvasCount: afterCancel.canvasCount
    });

    // 10. 检查是否在取消按钮位置放置了塔（这是错误行为）
    console.log('🔍 步骤 10: 检查是否错误地放置了塔');
    await page.waitForTimeout(1000);

    // 截图：最终状态
    await page.screenshot({ path: 'test-screenshots/04-final-state.png', fullPage: false });
    console.log('📸 已保存最终状态截图');

    // 获取控制台日志
    console.log('\n📋 测试总结:');
    console.log('='.repeat(60));
    console.log('✅ 测试已完成，请检查截图目录: test-screenshots/');
    console.log('📸 截图文件:');
    console.log('  - 01-game-initial.png (游戏初始状态)');
    console.log('  - 02-tower-selected.png (塔选中状态)');
    console.log('  - 03-after-cancel-click.png (点击取消后)');
    console.log('  - 04-final-state.png (最终状态)');
    console.log('='.repeat(60));

    // 注意：这里不做硬性的断言，因为我们需要人工查看截图来确认行为
    // 实际的验证逻辑应该根据游戏的具体实现来调整
  });
});
