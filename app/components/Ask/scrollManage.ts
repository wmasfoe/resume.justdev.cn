// scrollManager.ts
let savedScrollPosition = 0;
let originalStyles: {
  overflow?: string;
  position?: string;
  top?: string;
  width?: string;
  paddingRight?: string;
} = {};

/**
 * 禁用页面滚动
 */
export function disableScroll() {
  // 保存当前滚动位置和样式
  savedScrollPosition = window.scrollY;
  originalStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
    paddingRight: document.body.style.paddingRight,
  };

  // 计算滚动条宽度
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  // 应用禁止滚动的样式
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollPosition}px`;
  document.body.style.width = '100%';
  
  if (scrollBarWidth > 0) {
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }
}

/**
 * 启用页面滚动
 */
export function enableScroll() {
  // 恢复原始样式
  document.body.style.overflow = originalStyles.overflow || '';
  document.body.style.position = originalStyles.position || '';
  document.body.style.top = originalStyles.top || '';
  document.body.style.width = originalStyles.width || '';
  document.body.style.paddingRight = originalStyles.paddingRight || '';
  
  // 恢复滚动位置
  window.scrollTo(0, savedScrollPosition);
}