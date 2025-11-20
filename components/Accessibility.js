import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';

/**
 * 可访问性增强组件
 * 提供键盘导航、屏幕阅读器支持、高对比度模式等功能
 */
const Accessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // 检查用户偏好设置
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    setIsReducedMotion(prefersReducedMotion);
    setIsHighContrast(prefersHighContrast);

    // 从localStorage恢复设置
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast === 'true') setIsHighContrast(true);

    // 应用设置
    applyAccessibilitySettings();

    // 添加键盘导航支持
    setupKeyboardNavigation();

    // 添加跳转链接
    addSkipLinks();

    // 监听媒体查询变化
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    motionQuery.addEventListener('change', (e) => setIsReducedMotion(e.matches));
    contrastQuery.addEventListener('change', (e) => setIsHighContrast(e.matches));

    return () => {
      motionQuery.removeEventListener('change', (e) => setIsReducedMotion(e.matches));
      contrastQuery.removeEventListener('change', (e) => setIsHighContrast(e.matches));
    };
  }, []);

  useEffect(() => {
    applyAccessibilitySettings();
  }, [isHighContrast, fontSize, isReducedMotion]);

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;

    // 应用字体大小
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
    root.classList.add(`font-${fontSize}`);

    // 应用高对比度模式
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 应用减少动画
    if (isReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // 保存到localStorage
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-high-contrast', isHighContrast.toString());
  };

  const setupKeyboardNavigation = () => {
    // 为所有可交互元素添加焦点指示器
    const style = document.createElement('style');
    style.textContent = `.focus-visible:focus {
        outline: 2px solid #0066cc !important;
        outline-offset: 2px !important;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 9999;
        border-radius: 4px;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      /* 高コントラストモードスタイル */
      .high-contrast {
        filter: contrast(150%);
      }
      
      .high-contrast img {
        filter: contrast(120%);
      }
      
      /* フォントサイズスタイル */
      .font-small { font-size: 14px; }
      .font-normal { font-size: 16px; }
      .font-large { font-size: 18px; }
      .font-extra-large { font-size: 20px; }
      
      /* アニメーションを減らす */
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      /* スクリーンリーダー専用テキスト */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }`;


    document.head.appendChild(style);

    // 添加键盘事件监听
    document.addEventListener('keydown', (e) => {
      // Alt + H: 切换高对比度
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        toggleHighContrast();
      }

      // Alt + +: 增大字体
      if (e.altKey && e.key === '=') {
        e.preventDefault();
        increaseFontSize();
      }

      // Alt + -: 减小字体
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        decreaseFontSize();
      }
    });
  };

  const addSkipLinks = () => {
    // 添加跳转到主内容的链接
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = "\u4E3B\u8981\u30B3\u30F3\u30C6\u30F3\u30C4\u3078\u79FB\u52D5";
    skipLink.setAttribute('aria-label', "\u4E3B\u8981\u30B3\u30F3\u30C6\u30F3\u30C4\u3078\u79FB\u52D5");

    document.body.insertBefore(skipLink, document.body.firstChild);

    // 确保主内容区域有正确的ID
    const mainContent = document.querySelector('main') || document.querySelector('#__next');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  };

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    announceToScreenReader(isHighContrast ? "\u9AD8\u30B3\u30F3\u30C8\u30E9\u30B9\u30C8\u30E2\u30FC\u30C9\u304C\u30AA\u30D5\u306B\u306A\u308A\u307E\u3057\u305F\u3002" : "\u9AD8\u30B3\u30F3\u30C8\u30E9\u30B9\u30C8\u30E2\u30FC\u30C9\u304C\u6709\u52B9\u306B\u306A\u308A\u307E\u3057\u305F");
  };

  const increaseFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      const newSize = sizes[currentIndex + 1];
      setFontSize(newSize);
      announceToScreenReader(`フォントサイズが調整されました。${newSize}`);
    }
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      const newSize = sizes[currentIndex - 1];
      setFontSize(newSize);
      announceToScreenReader(`フォントサイズが調整されました。${newSize}`);
    }
  };

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // 如果禁用了可访问性功能，不渲染组件
  if (!siteConfig('ACCESSIBILITY_ENABLED', true)) {
    return null;
  }

  return (
    <>
      {/* 可访问性控制面板 */}
      <div
        className="accessibility-controls fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 border"
        role="region"
        aria-label="\u30A2\u30AF\u30BB\u30B7\u30D3\u30EA\u30C6\u30A3\u5236\u5FA1">

        <h3 className="text-sm font-semibold mb-2">可访问性选项</h3>
        
        <div className="space-y-2">
          <button
            onClick={toggleHighContrast}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-pressed={isHighContrast}>

            {isHighContrast ? "\u9589\u3058\u308B" : "\u958B\u59CB\u3059\u308B"}高对比度
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseFontSize}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              aria-label="\u30D5\u30A9\u30F3\u30C8\u30B5\u30A4\u30BA\u3092\u5C0F\u3055\u304F\u3059\u308B"
              disabled={fontSize === 'small'}>

              A-
            </button>
            <span className="text-xs">字体</span>
            <button
              onClick={increaseFontSize}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              aria-label="\u30D5\u30A9\u30F3\u30C8\u30B5\u30A4\u30BA\u3092\u5927\u304D\u304F\u3059\u308B"
              disabled={fontSize === 'extra-large'}>

              A+
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          快捷键: Alt+H (对比度), Alt+/- (字体)
        </div>
      </div>

      {/* 屏幕阅读器公告区域 */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
    </>);

};

export default Accessibility;