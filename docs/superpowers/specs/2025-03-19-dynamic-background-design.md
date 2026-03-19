# 农场防御动态时间背景系统设计文档

## 概述

为GameScene创建动态时间系统,包含4个时间阶段(白天/黄昏/夜晚),过渡动画,天气效果,环境动画,无需外部资源。

## 目标用户

游戏玩家,期望沉浸式农场防御体验。

## 需求

### 功能性需求
- 4个时间阶段: 白天(明亮蓝天)、黄昏(暖橘夕照)、夜晚(深蓝星空)
- 平滑时间过渡(2秒渐变)
- 天气效果: 晴/雨/雪
- 环境动画: 云朵飘动、风吹植物
- 随关卡自动变换时间

### 非功能性需求
- 性能: 60fps流畅运行
- 移动端兼容
- 无需外部美术资源

## 架构设计

```
┌─────────────────────────────────────────────────┐
│ BackgroundSystem (主控制器)                      │
│ ├─ SkyLayer (天空层 - 渐变色+云朵)               │
│ ├─ WeatherLayer (天气层 - 雨/粒子)               │
│ ├─ HorizonLayer (地平线层 - 远山)                │
│ └─ AmbientLayer (环境层 - 花草树木+动画)         │
└─────────────────────────────────────────────────┘
```

## 时间系统

### 时间阶段

| 阶段 | 天空颜色(上→下) | 光照角度 | 特点 |
|------|-----------------|----------|------|
| Day (白天) | #87CEEB → #E0F6FF | 高 | 明亮、有活力 |
| Dusk (黄昏) | #FF6B35 → #F4A460 | 低 | 暖色调、长影 |
| Night (夜晚) | #0B1026 → #1a1a2e | - | 深蓝、有星光 |

### 过渡机制

- 使用 `Phaser.Tweens` 实现颜色渐变
- 每关对应一个时间阶段(循环)
- 过渡时长: 2秒

## 视觉效果

### 天空层
- 渐变: Graphics.fillGradientStyle动态切换
- 云朵: 10-15个圆形,带Tween水平移动
- 太阳/月亮: 圆形+发光效果

### 天气层
- 下雨: Phaser.Particles(线条粒子)
- 下雪: Phaser.Particles(圆形粒子)

### 地平层
- 远山: 多边形轮廓
- 保留现有装饰(谷仓、风车emoji)

### 环境层
- 保留现有emoji(花、树)
- 添加摇摆动画(Sine wave)

## API设计

```typescript
// src/systems/BackgroundSystem.ts
class BackgroundSystem {
  constructor(scene: GameScene);
  create(): void;
  update(time: number, delta: number): void;
  setTimeOfDay(time: 'day' | 'dusk' | 'night'): void;
  setWeather(weather: 'clear' | 'rain' | 'snow'): void;
  transitionToNextPhase(): void;
}
```

## 文件结构

```
src/systems/
├── BackgroundSystem.ts (主控制器)
├── SkyLayer.ts
├── WeatherLayer.ts
├── HorizonLayer.ts
└── AmbientEffects.ts
```

## 无资源策略

- 所有图形: Phaser原生(Graphics/Circle/Rectangle)
- emoji继续使用
- 颜色使用Hex值
- 动画使用Tween和粒子
