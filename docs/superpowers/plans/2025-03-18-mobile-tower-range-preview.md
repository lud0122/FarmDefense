# 移动端塔攻击范围预览功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在移动端添加塔攻击范围预览功能，当选中塔类型后，手指移动到游戏区域时自动显示攻击范围

**Architecture:** 扩展现有 `GameScene.handlePointerMove()` 方法，增加移动端判断逻辑，复用现有的 `updatePreviewRange()` 和 `clearPreviewRange()` 方法。添加 `isTouchInGameArea()` 方法动态排除移动端UI元素区域。

**Tech Stack:** TypeScript, Phaser 3.70, Vite

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/game/GameScene.ts` | 修改 | 添加移动端范围预览逻辑 |
| `src/ui/VirtualJoystick.ts` | 可选修改 | 如缺少 `getPosition()` 方法需添加 |

---

## Task 1: 准备工作 - 检查现有代码

**Files:**
- Read: `src/game/GameScene.ts`
- Read: `src/ui/VirtualJoystick.ts` (检查是否有 getPosition 方法)

- [ ] **Step 1: 读取 GameScene.ts 确认现有结构**
  ```bash
  head -50 src/game/GameScene.ts
  ```
  Expected: 确认 `isMobileDevice`, `mobileTowerPanel`, `_mobileToolbar`, `joystick` 等属性存在

- [ ] **Step 2: 检查 VirtualJoystick 是否有 getPosition 方法**
  ```bash
  grep -n "getPosition" src/ui/VirtualJoystick.ts
  ```
  Expected: 找到 `getPosition()` 方法，或需后续添加

- [ ] **Step 3: 确认 handlePointerMove 存在并检查其结构**
  ```bash
  grep -n -A 20 "handlePointerMove" src/game/GameScene.ts
  ```
  Expected: 找到现有方法，准备修改

---

## Task 2: 添加移动端UI区域判断方法

**Files:**
- Modify: `src/game/GameScene.ts:75-90` (在现有属性声明后添加新方法)

- [ ] **Step 1: 在 GameScene 类中添加属性声明**
  找到 `private previewRangeCircle: ...` 这一行，在其后添加：
  ```typescript
  private lastPreviewUpdateTime: number = 0;
  private readonly PREVIEW_UPDATE_INTERVAL: number = 16; // 约60fps
  ```

- [ ] **Step 2: 添加 isTouchInGameArea 方法**
  在 `handlePointerMove` 方法之前添加新方法：
  ```typescript
  /**
   * 判断触摸点是否在游戏可交互区域
   * 排除移动端UI元素（塔选择面板、工具栏、虚拟摇杆）
   */
  private isTouchInGameArea(pointer: Phaser.Input.Pointer): boolean {
    // 排除底部塔选择面板区域
    if (this.mobileTowerPanel) {
      const panelY = this.mobileTowerPanel.y;
      const panelHeight = 100; // MobileTowerPanel.panelHeight
      if (pointer.y > panelY - panelHeight / 2) return false;
    }

    // 排除工具栏区域
    if (this._mobileToolbar) {
      const toolbarY = this._mobileToolbar.y;
      const toolbarHeight = 70;
      const toolbarWidth = 150;
      // 以屏幕中心(400)为基准计算工具栏范围
      if (pointer.y >= toolbarY - toolbarHeight / 2 &&
          pointer.y < toolbarY + toolbarHeight / 2 &&
          pointer.x >= 400 - toolbarWidth / 2 &&
          pointer.x <= 400 + toolbarWidth / 2) {
        return false;
      }
    }

    // 排除虚拟摇杆区域
    if (this.joystick) {
      const joystickPos = this.joystick.getPosition();
      const joystickRadius = 80; // baseRadius(60) + 扩展区域(20)
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        joystickPos.x, joystickPos.y
      );
      if (distance < joystickRadius) return false;
    }

    return true;
  }
  ```

- [ ] **Step 3: 验证添加的方法和属性**
  运行类型检查：
  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```
  Expected: 无错误，或仅显示与本次修改无关的错误

---

## Task 3: 修改 handlePointerMove 方法

**Files:**
- Modify: `src/game/GameScene.ts:762-776` (替换整个方法)

- [ ] **Step 1: 用新实现替换 handlePointerMove 方法**
  ```typescript
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.selectedTowerKey) {
      // 先判断是否在游戏区域（不节流）
      const isInGameArea = this.isMobileDevice
        ? this.isTouchInGameArea(pointer)
        : pointer.y <= 520;

      if (!isInGameArea) {
        this.clearPreviewRange();
        this.lastPreviewUpdateTime = 0; // 离开区域时重置
        return;
      }

      // 检查是否是首次进入（lastPreviewUpdateTime为0）
      const now = Date.now();
      const isFirstEnter = this.lastPreviewUpdateTime === 0;
      const shouldUpdate = isFirstEnter ||
        (now - this.lastPreviewUpdateTime >= this.PREVIEW_UPDATE_INTERVAL);

      if (shouldUpdate) {
        this.lastPreviewUpdateTime = now;
        this.updatePreviewRange(pointer.x, pointer.y);
      }
    } else {
      this.clearPreviewRange();
      this.lastPreviewUpdateTime = 0;
    }
  }
  ```

- [ ] **Step 2: 运行类型检查**
  ```bash
  npx tsc --noEmit 2>&1 | grep -E "(error|Error)" | head -20
  ```
  Expected: 无类型错误

---

## Task 4: 为 VirtualJoystick 添加 getPosition 方法（如不存在）

**Files:**
- Modify: `src/ui/VirtualJoystick.ts` (添加 getPosition 方法)

如果 VirtualJoystick 类没有 `getPosition()` 方法，需要添加：

- [ ] **Step 1: 检查 VirtualJoystick 是否有 getPosition 方法**
  ```bash
  grep -n "getPosition" src/ui/VirtualJoystick.ts
  ```
  Expected: 如果找到则跳过此任务，如果未找到则继续

- [ ] **Step 2: 添加 getPosition 方法**
  在 VirtualJoystick 类中找到合适位置（如 destroy 方法之前）添加：
  ```typescript
  /**
   * 获取摇杆当前位置
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
  ```

- [ ] **Step 3: 运行类型检查**
  ```bash
  npx tsc --noEmit 2>&1 | grep -E "VirtualJoystick"
  ```
  Expected: 无错误

---

## Task 5: 手动测试

**Files:**
- None (manual testing)

- [ ] **Step 1: 启动开发服务器**
  ```bash
  npm run dev
  ```
  Expected: 服务器启动在 http://localhost:5173

- [ ] **Step 2: 使用桌面浏览器测试（确保原有功能正常）**
  1. 在桌面浏览器打开 http://localhost:5173
  2. 点击任意塔按钮选中
  3. 移动鼠标到游戏区域
  4. Expected: 显示绿色攻击范围预览圆圈

- [ ] **Step 3: 使用移动端模拟器测试**
  1. 按 F12 打开 DevTools
  2. 按 Ctrl+Shift+M 切换到设备模拟器
  3. 选择 iPhone SE 或类似移动设备
  4. 点击任意塔按钮选中
  5. 在屏幕上拖动手指
  6. Expected:
     - 在塔选择面板区域不显示预览
     - 在工具栏区域不显示预览
     - 在虚拟摇杆区域不显示预览
     - 在游戏其他区域显示绿色攻击范围预览

---

## Task 6: 提交代码

- [ ] **Step 1: 检查修改**
  ```bash
  git status
  git diff src/game/GameScene.ts
  ```
  Expected: 显示正确的修改内容

- [ ] **Step 2: 提交修改**
  ```bash
  git add src/game/GameScene.ts
  if [ -f src/ui/VirtualJoystick.ts ]; then
    git add src/ui/VirtualJoystick.ts
  fi
  git commit -m "feat: 移动端塔攻击范围预览功能

- 添加 isTouchInGameArea() 方法动态排除UI区域
- 修改 handlePointerMove() 支持移动端触摸范围预览
- 添加节流机制确保性能（16ms间隔，约60fps）
- 首次进入游戏区域立即显示预览，无延迟感
- 复用桌面端现有 updatePreviewRange() 和 clearPreviewRange() 方法"
  ```

---

## Task 7: 运行单元测试（如有）

- [ ] **Step 1: 运行测试**
  ```bash
  npm test
  ```
  Expected: 所有测试通过

---

## 注意事项

1. **VirtualJoystick 依赖**: 如果 VirtualJoystick 已经在回调中处理 `getPosition()`，可以直接使用。否则需要添加该方法。

2. **UI区域坐标**:
   - 塔选择面板: y = 540, 高度 = 100
   - 工具栏: y = 420, 高度 = 70
   - 虚拟摇杆: 位置 (720, 540), 半径 = 60 + 扩展20 = 80
   这些是GameScene.ts中的实际值

3. **性能优化**:
   - 16ms节流确保60fps流畅运行
   - 离开UI区域立即清除预览
   - 首次进入无延迟

4. **兼容性**:
   - 桌面端使用原有逻辑 `pointer.y <= 520`
   - 移动端使用新的 `isTouchInGameArea()` 方法
