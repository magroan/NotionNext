/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

/**
 * 下载按钮
 * @returns
 */
export default function DownloadButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // 判断用户是在PWA中打开，就隐藏
    const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://');

    if ('serviceWorker' in navigator && !isInStandaloneMode()) {
      setShowButton(true);
      window.addEventListener('load', () => {
        navigator.serviceWorker.
        register('/service-worker.js').
        then((registration) => {
          console.log("Service Worker\u306E\u767B\u9332\u304C\u6210\u529F\u3057\u307E\u3057\u305F:", registration);
        }).
        catch((error) => {
          console.log("\u30B5\u30FC\u30D3\u30B9\u30EF\u30FC\u30AB\u30FC\u306E\u767B\u9332\u306B\u5931\u6557\u3057\u307E\u3057\u305F:", error);
        });
      });

      window.addEventListener('beforeinstallprompt', (event) => {
        // 阻止浏览器默认的安装提示
        event.preventDefault();
        // 保存安装提示的事件
        window.deferredPrompt = event;
        // 在按钮上显示一个标识，提示用户可以安装应用
        setShowButton(true);
      });
    }
  }, []);

  /**
   * 点击后提示用户安装
   */
  function download() {
    // 检查是否支持安装提示
    if (window.deferredPrompt) {
      // 显示安装提示
      window.deferredPrompt.prompt();
      // 等待用户做出选择
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // 用户已安装，隐藏按钮
          setShowButton(false);
          console.log("\u30E6\u30FC\u30B6\u30FC\u306F\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u306B\u540C\u610F\u3057\u307E\u3057\u305F\u3002");
        } else {
          console.log("\u30E6\u30FC\u30B6\u30FC\u304C\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3092\u62D2\u5426\u3057\u307E\u3057\u305F");
        }
        // 清除安装提示
        window.deferredPrompt = null;
      });
    }
  }

  return (
    <>
      {showButton &&
      <div
        className=' justify-center items-center md:flex hidden group text-white w-full rounded-lg m-2 md:m-0 p-2 hover:bg-gray-700 bg-[#1F2030] md:rounded-none md:bg-none'
        onClick={download}>
          <i
          alt='download'
          title='download'
          className='cursor-pointer fas fa-download group-hover:scale-125 transition-all duration-150 ' />

          <span className='h-full flex mx-2 md:hidden items-center select-none'>
            Download
          </span>
        </div>
      }
    </>);

}