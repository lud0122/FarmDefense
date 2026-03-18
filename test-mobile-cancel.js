import { chromium } from 'playwright';
import fs from 'fs';

async function testMobileCancelButton() {
  console.log('🎮 FarmDefense 移动端取消按钮测试');
  console.log('='.repeat(60));

  // 创建截图目录
  const screenshotDir = './test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 启动浏览器（移动端模式：iPhone 14）
  const browser = await chromium.launch({
    headless: true, // 无头模式，不需要X Server
    slowMo: 500, // 每个操作延迟500ms，便于观察
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();

  // 监听控制台输出
  page.on('console', msg => {
    console.log(`[浏览器] ${msg.type()}: ${msg.text()}`);
  });

  try {
    // 1. 打开游戏页面
    console.log('\n📱 步骤 1: 打开游戏页面');
    await page.goto('http://localhost:3000/FarmDefense/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/01-initial.png` });
    console.log('✅ 页面已加载');

    // 2. 进入游戏场景
    console.log('\n🎯 步骤 2: 进入游戏场景');
    const startButton = await page.locator('button:has-text("开始"), button:has-text("START"), text=开始').first();
    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 已点击开始按钮');
    } else {
      console.log('ℹ️  未找到开始按钮，可能已在游戏场景');
    }

    await page.screenshot({ path: `${screenshotDir}/02-game-scene.png` });
    console.log('✅ 已进入游戏场景');

    // 3. 选择塔
    console.log('\n🏰 步骤 3: 选择塔类型');
    const canvas = await page.locator('canvas').first();
    const box = await canvas.boundingBox();

    if (box) {
      console.log(`📐 Canvas 尺寸: ${box.width}x${box.height}`);

      // 尝试点击底部塔选择面板（移动端塔面板通常在底部）
      // 点击左侧第一个塔（通常是PistolTower）
      await canvas.click({ position: { x: 80, y: box.height - 40 } });
      await page.waitForTimeout(1000);
      console.log('✅ 已选择塔');

      await page.screenshot({ path: `${screenshotDir}/03-tower-selected.png` });
    }

    // 4. 验证攻击范围预览
    console.log('\n🔍 步骤 4: 验证攻击范围预览');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/04-range-preview.png` });
    console.log('✅ 已捕获攻击范围预览');

    // 5. 点击取消按钮
    console.log('\n❌ 步骤 5: 点击取消按钮');
    console.log('📍 尝试定位取消按钮...');

    // 查找可能的取消按钮位置
    // 移动端工具栏通常在右下角
    if (box) {
      // 点击右下角区域（取消按钮位置）
      const cancelX = box.width - 50;
      const cancelY = box.height - 100;
      console.log(`📍 点击位置: (${cancelX}, ${cancelY})`);

      await canvas.click({ position: { x: cancelX, y: cancelY } });
      await page.waitForTimeout(1500);

      await page.screenshot({ path: `${screenshotDir}/05-after-cancel.png` });
      console.log('✅ 已点击取消按钮');
    }

    // 6. 检查结果
    console.log('\n📊 步骤 6: 检查结果');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/06-final-state.png` });
    console.log('✅ 已捕获最终状态');

    console.log('\n' + '='.repeat(60));
    console.log('📋 测试完成');
    console.log('📸 截图已保存到 test-screenshots/ 目录:');
    console.log('  - 01-initial.png (初始页面)');
    console.log('  - 02-game-scene.png (游戏场景)');
    console.log('  - 03-tower-selected.png (选中塔后)');
    console.log('  - 04-range-preview.png (攻击范围预览)');
    console.log('  - 05-after-cancel.png (点击取消后)');
    console.log('  - 06-final-state.png (最终状态)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 测试出错:', error.message);
    await page.screenshot({ path: `${screenshotDir}/error.png` });
    console.error('📸 错误截图已保存');
  } finally {
    // 保持浏览器打开10秒以便观察
    console.log('\n⏱️  浏览器将在10秒后关闭...');
    await page.waitForTimeout(10000);

    await browser.close();
    console.log('👋 测试结束');
  }
}

// 运行测试
testMobileCancelButton().catch(console.error);
