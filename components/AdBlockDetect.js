import { useEffect } from 'react';

/**
 * 检测广告插件
 * @returns
 */
export default function AdBlockDetect() {
  useEffect(() => {
    // 如果检测到广告屏蔽插件
    function ABDetected() {
      if (!document) {
        return;
      }
      const wwadsCns = document.getElementsByClassName('wwads-cn');
      if (wwadsCns && wwadsCns.length > 0) {
        for (const wwadsCn of wwadsCns) {
          wwadsCn.insertAdjacentHTML(
            'beforeend',
            "<a href='https://wwads.cn/page/whitelist-wwads' class='wwads-img' target='_blank' rel='nofollow'><img src='https://creatives-1301677708.file.myqcloud.com/images/placeholder/wwads-friendly-ads.png' width='130'></a><div class='wwads-content'><a href='https://wwads.cn/page/whitelist-wwads' class='wwads-text' target='_blank' rel='nofollow'>\u5F53\u30B5\u30A4\u30C8\u306E\u9577\u671F\u904B\u55B6\u306E\u305F\u3081\u306B\u3001\u5E83\u544A\u30D6\u30ED\u30C3\u30AB\u30FC\u306E\u30DB\u30EF\u30A4\u30C8\u30EA\u30B9\u30C8\u306B\u5F53\u30B5\u30A4\u30C8\u3092\u8FFD\u52A0\u3057\u3066\u3044\u305F\u3060\u3051\u308B\u3068\u5E78\u3044\u3067\u3059\u3002\u3054\u652F\u63F4\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01</a><a href='https://wwads.cn/page/end-user-privacy' class='wwads-poweredby' title='\u4E07\u7EF4\u5E83\u544A \uFF5E \u5E83\u544A\u3092\u3088\u308A\u512A\u96C5\u3067\u6709\u7528\u306B' target='_blank'><span>\u4E07\u7EF4</span><span>\u5E83\u544A</span></a></div><a class='wwads-hide' onclick='parentNode.remove()' title='\u5E83\u544A\u3092\u96A0\u3059'><svg xmlns='http://www.w3.org/2000/svg' width='6' height='7'><path d='M.879.672L3 2.793 5.121.672a.5.5 0 11.707.707L3.708 3.5l2.12 2.121a.5.5 0 11-.707.707l-2.12-2.12-2.122 2.12a.5.5 0 11-.707-.707l2.121-2.12L.172 1.378A.5.5 0 01.879.672z'></path></svg></a>"
          );
        }
      }
    }

    // check document ready
    function docReady(t) {
      document.readyState === 'complete' ||
      document.readyState === 'interactive' ?
      setTimeout(() => t(), 1) :
      document.addEventListener('DOMContentLoaded', t);
    }

    // check if wwads' fire function was blocked after document is ready with 3s timeout (waiting the ad loading)
    docReady(function () {
      setTimeout(function () {
        if (window._AdBlockInit === undefined) {
          ABDetected();
        }
      }, 3000);
    });
  }, []);
  return null;
}