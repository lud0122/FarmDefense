/**
 * 移动端检测工具模块
 * 用于检测设备类型和移动端特性
 */

/**
 * 检测是否为移动设备
 * @returns boolean - 是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(navigator.userAgent);
}

/**
 * 检测是否为 iOS 设备
 * @returns boolean - 是否为 iOS 设备
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * 检测是否为 Android 设备
 * @returns boolean - 是否为 Android 设备
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /Android/i.test(navigator.userAgent);
}

/**
 * 获取屏幕宽度
 * @returns number - 屏幕宽度（像素）
 */
export function getScreenWidth(): number {
  if (typeof window === 'undefined') {
    return 800;
  }
  return window.innerWidth;
}

/**
 * 获取屏幕高度
 * @returns number - 屏幕高度（像素）
 */
export function getScreenHeight(): number {
  if (typeof window === 'undefined') {
    return 600;
  }
  return window.innerHeight;
}

/**
 * 判断是否为横屏模式
 * @returns boolean - 是否为横屏
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return window.innerWidth > window.innerHeight;
}
