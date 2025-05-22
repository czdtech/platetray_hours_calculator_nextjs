/**
 * 此工具函数根据用户减少动画偏好，返回对应的CSS类名
 * 当用户启用了减少动画时，将移除动画效果
 */
export function getAnimationClass(animationClass: string): string {
  // 动态检测用户减少动画偏好设置
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // 移除动画相关类，返回空字符串
    return '';
  }
  
  // 返回原始动画类名
  return animationClass;
}

/**
 * 根据用户减少动画偏好，返回动画时长
 */
export function getTransitionDuration(defaultDuration: number): number {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // 对于偏好减少动画的用户，返回极短的过渡时间
    return 0.01;
  }
  return defaultDuration;
}