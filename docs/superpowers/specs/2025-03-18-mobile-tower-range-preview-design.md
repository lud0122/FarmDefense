# 移动端塔攻击范围预览功能设计文档

## 概述
在移动端选中塔类型后，当用户手指移动到游戏区域时，自动显示当前塔的攻击范围预览，帮助用户决策塔的放置位置。

## 需求背景
- 桌面端已实现：鼠标移动时显示攻击范围预览
- 移动端当前：选中塔后无法预览范围，影响放置决策
- 目标：移动端与桌面端体验一致

## 设计决策

### 触发时机
**选中塔类型后，触摸屏幕游戏区域时显示**
- 与桌面端行为保持一致
- 用户点击塔按钮选中后，手指移动到游戏区域自动显示预览圆圈

### 视觉样式
**与桌面端完全一致**
- 半透明绿色填充圆圈（透明度 0.1）
- 绿色边线（透明度 0.5，线宽 2px）
- 中心点标记（绿色小圆点，半径 4px）

## 技术实现方案

### 方案选择
采用方案A：扩展现有 pointermove 逻辑

### 核心修改

#### 1. GameScene.ts - handlePointerMove() 增强
```typescript
private handlePointerMove(pointer: Phaser.Input.Pointer): void {
  // 如果有选中的塔类型，显示攻击范围预览
  if (this.selectedTowerKey) {
    // 判断是否在游戏区域
    const isInGameArea = this.isMobileDevice
      ? this.isTouchInGameArea(pointer)  // 移动端：自定义判断
      : pointer.y <= 520;                 // 桌面端：原有逻辑

    if (isInGameArea) {
      this.updatePreviewRange(pointer.x, pointer.y);
    } else {
      this.clearPreviewRange();
    }
  } else {
    this.clearPreviewRange();
  }
}
```

#### 2. 新增 isTouchInGameArea() 方法
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

### 性能优化

#### 节流机制 - 最终版本
确保首次进入游戏区域时立即显示预览，后续移动应用节流：

```typescript
private lastPreviewUpdateTime: number = 0;
private readonly PREVIEW_UPDATE_INTERVAL: number = 16; // 约60fps

private handlePointerMove(pointer: Phaser.Input.Pointer): void {
  if (this.selectedTowerKey) {
    // 先判断是否在游戏区域（不节流）
    const isInGameArea = this.isMobileDevice
      ? this.isTouchInGameArea(pointer)
      : pointer.y <= 520;

    if (!isInGameArea) {
      this.clearPreviewRange();
      this.lastPreviewUpdateTime = 0; // 离开区域时重置，下次进入能立即显示
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

## 交互流程

### 正常流程
1. 用户点击塔按钮 → selectedTowerKey 被设置
2. 手指移动到游戏区域 → handlePointerMove 触发
3. isTouchInGameArea() 返回 true
4. updatePreviewRange() 绘制范围圆圈
5. 手指移出游戏区域 → clearPreviewRange()

### 取消流程
1. 用户点击工具栏"取消"按钮
2. deselectTower() 被调用
3. selectedTowerKey = null
4. clearPreviewRange() 清除预览

## 边界情况处理

### 触摸到移动端UI元素
- 触摸点在塔选择面板（mobileTowerPanel 区域）→ 不显示预览
- 触摸点在工具栏（_mobileToolbar 区域）→ 不显示预览
- 触摸点在虚拟摇杆（joystick 半径80px范围内）→ 不显示预览

### 快速滑动
- 节流机制防止过度渲染
- 离开游戏区域时立即清除预览

### 多点触摸
- 仅响应第一个触摸点（使用 activePointer）

## 兼容性考虑

### 桌面端保持原有行为
- isMobileDevice 标志区分逻辑分支
- 桌面端继续使用 pointer.y <= 520 判断

### 移动端独立判断
- isTouchInGameArea() 方法专门处理移动端布局
- 方便未来调整移动端UI布局

## 文件变更

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| src/game/GameScene.ts | 修改 | 添加移动端范围预览逻辑 |

## 测试要求

### 功能测试
- [ ] 移动端选中塔后，手指移动显示范围预览
- [ ] 桌面端原有功能不受影响
- [ ] 触摸到UI区域不显示预览
- [ ] 快速移动手指无卡顿

### 性能测试
- [ ] 60fps 流畅运行
- [ ] 内存无泄漏

## 注意事项

1. 保持与桌面端视觉一致
2. 性能优化：节流机制
3. 边界情况：UI区域排除
4. 兼容性：桌面端行为不变
