import { siteConfig } from '@/lib/config';
import { useEffect, useState } from 'react';

const LoadingCover = ({ onFinishLoading }) => {
  const [isVisible, setIsVisible] = useState(true);
  const welcomeText = siteConfig('PROXIO_WELCOME_TEXT', "\u79C1\u305F\u3061\u306E\u30A6\u30A7\u30D6\u30B5\u30A4\u30C8\u3078\u3088\u3046\u3053\u305D\uFF01");

  // 定义颜色变量
  const colors = {
    backgroundStart: '#1a1a1a', // 深灰色
    backgroundMiddle: '#4d4d4d', // 中灰色
    backgroundEnd: '#e6e6e6', // 浅灰色
    textColor: '#ffffff', // 白色
    rippleColor: 'rgba(255, 255, 255, 0.6)' // 半透明白色
  };

  useEffect(() => {
    const pageContainer = document.getElementById('pageContainer');

    const handleClick = (e) => {
      // 创建扩散光圈
      const ripple = document.createElement('div');
      ripple.classList.add('ripple');
      ripple.style.left = `${e.clientX - 10}px`;
      ripple.style.top = `${e.clientY - 10}px`;
      document.body.appendChild(ripple);

      // 添加页面缩放 + 模糊动画
      pageContainer?.classList?.add('page-clicked');

      // 模拟加载完成，调用回调函数
      setTimeout(() => {
        setIsVisible(false); // 淡出动画
        setTimeout(() => {
          if (onFinishLoading) {
            onFinishLoading();
          }
        }, 600); // 等待淡出动画完成
      }, 1200);

      // 清理 ripple 元素
      setTimeout(() => {
        ripple.remove();
      }, 1000);
    };

    document.body.addEventListener('click', handleClick);

    return () => {
      document.body.removeEventListener('click', handleClick);
    };
  }, [onFinishLoading]);

  if (!isVisible) return null;

  return (
    <div className="welcome" id="pageContainer">
            <div className="welcome-text px-2" id="welcomeText">
                {welcomeText}
            </div>
            <style jsx>
                {`
                    body {
                        margin: 0;
                        background-color: ${colors.backgroundStart};
                        height: 100vh;
                        overflow: hidden;
                        cursor: pointer;
                    }

                    .welcome {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        width: 100vw;
                        position: fixed;
                        top: 0;
                        left: 0;
                        z-index: 9999;
                        pointer-events: auto;
                        background: linear-gradient(120deg, ${colors.backgroundStart}, ${colors.backgroundMiddle}, ${colors.backgroundEnd});
                        background-size: 300% 300%;
                        animation: gradientShift 6s ease infinite;
                        transition: opacity 0.6s ease; /* フェードアウトアニメーション */
                    }

                    .welcome.page-clicked {
                        opacity: 0;
                        pointer-events: none;
                    }

                    .welcome-text {
                        font-size: 2.5rem;
                        font-weight: bold;
                        color:${colors.textColor};${











        colors.rippleColor}0%、透明70%);
                        ポインターイベント: 無効;
                        幅: 20px;
                        高さ: 20px;
                        変形: スケール(0);
                        不透明度: 0.8;
                        z-index: 10;
                        アニメーション: rippleExpand 1s ease-out forwards;
                    }

                    /* ダイナミック背景アニメーション */
                    @keyframes gradientShift {
                        0% {
                            背景位置: 0% 50%;
                        }
                        50% {
                            背景位置: 100% 50%;
                        }
                        100% {
                            背景位置: 0% 50%;
                        }
                    }

                    /* テキスト脈動アニメーション */
                    @keyframes textPulse {
                        0%, 100% {
                            変形: スケール(1);
                            テキストシャドウ: 0 0 15px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6);
                        }
                        50% {
                            変形: スケール(1.1);
                            テキストシャドウ: 0 0 25px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.8);
                        }
                    }

                    /* テキストフェードインアニメーション */
                    @keyframes fadeInUp {
                        0% {
                            不透明度: 0;
                            変形: translateY(50px);
                        }
                        100% {
                            不透明度: 1;
                            変形: translateY(0);
                        }
                    }

                    /* 波紋の拡大アニメーション */
                    @keyframes rippleExpand {
                        to {
                            変形: スケール(40);
                            不透明度: 0;
                        }
                    }`
        }
            </style>
        </div>);

};

export default LoadingCover;