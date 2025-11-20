import { siteConfig } from '@/lib/config';
import { useGlobal } from '@/lib/global';
import { isBrowser, loadExternalResource } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
/**
 * OpenWrite公众号导流插件
 * 使用介绍：https://openwrite.cn/guide/readmore/readmore.html#%E4%BA%8C%E3%80%81%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8
 * 登录后台配置你的博客：https://readmore.openwrite.cn/
 * @returns
 */
const OpenWrite = () => {
  const router = useRouter();
  const qrcode = siteConfig('OPEN_WRITE_QRCODE', "\u516C\u4F17\u53F7\u306EQR\u30B3\u30FC\u30C9\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const blogId = siteConfig('OPEN_WRITE_BLOG_ID');
  const name = siteConfig('OPEN_WRITE_NAME', "\u30E1\u30C7\u30A3\u30A2\u306E\u540D\u524D\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const id = 'article-wrapper';
  const keyword = siteConfig('OPEN_WRITE_KEYWORD', "\u30E1\u30C7\u30A3\u30A2\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u30AD\u30FC\u30EF\u30FC\u30C9\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const btnText = siteConfig(
    'OPEN_WRITE_BTN_TEXT',
    "\u30AA\u30EA\u30B8\u30CA\u30EB\u306F\u96E3\u3057\u3044\u3001\u4EBA\u9593\u3068\u6A5F\u68B0\u306E\u691C\u51FA\u3092\u5B8C\u4E86\u3057\u3001\u5168\u6587\u3092\u8AAD\u3080"
  );
  // 验证一次后的有效时长，单位小时
  const cookieAge = siteConfig('OPEN_WRITE_VALIDITY_DURATION', 1);
  // 白名单，想要放行的页面
  const whiteList = siteConfig('OPEN_WRITE_WHITE_LIST', '');
  // 黄名单，优先级最高，设置后只有这里的路径会被上锁，其他页面自动全部放行
  const yellowList = siteConfig('OPEN_WRITE_YELLOW_LIST', '');

  // 登录信息
  const { isLoaded, isSignedIn } = useGlobal();

  const loadOpenWrite = async () => {
    try {
      await loadExternalResource(
        'https://readmore.openwrite.cn/js/readmore-2.0.js',
        'js'
      );
      const BTWPlugin = window?.BTWPlugin;

      if (BTWPlugin) {
        const btw = new BTWPlugin();
        window.btw = btw;
        btw.init({
          qrcode,
          id,
          name,
          btnText,
          keyword,
          blogId,
          cookieAge
        });

        // btw初始化后，开始监听read-more-wrap何时消失
        const intervalId = setInterval(() => {
          const readMoreWrapElement = document.getElementById('read-more-wrap');
          const articleWrapElement = document.getElementById('article-wrapper');

          if (!readMoreWrapElement && articleWrapElement) {
            toggleTocItems(false); // 恢复目录项的点击
            // 自动调整文章区域的高度
            articleWrapElement.style.height = 'auto';
            // 停止定时器
            clearInterval(intervalId);
          }
        }, 1000); // 每秒检查一次

        // Return cleanup function to clear the interval if the component unmounts
        return () => clearInterval(intervalId);
      }
    } catch (error) {
      console.error("OpenWrite\u306E\u8AAD\u307F\u8FBC\u307F\u7570\u5E38", error);
    }
  };
  useEffect(() => {
    const isInYellowList = isPathInList(router.asPath, yellowList);
    const isInWhiteList = isPathInList(router.asPath, whiteList);

    // 优先判断黄名单
    if (yellowList && yellowList.length > 0) {
      if (!isInYellowList) {
        console.log("\u73FE\u5728\u306E\u30D1\u30B9\u306F\u30DB\u30EF\u30A4\u30C8\u30EA\u30B9\u30C8\u306B\u3042\u308A\u307E\u305B\u3093\u304C\u3001\u901A\u904E\u3057\u307E\u3059\u3002");
        return;
      }
    } else if (isInWhiteList) {
      // 白名单中，免检
      console.log("\u73FE\u5728\u306E\u30D1\u30B9\u306F\u30DB\u30EF\u30A4\u30C8\u30EA\u30B9\u30C8\u306B\u542B\u307E\u308C\u3066\u3044\u308B\u305F\u3081\u3001\u8A31\u53EF\u3057\u307E\u3059\u3002");
      return;
    }

    if (isSignedIn) {
      // 用户已登录免检
      console.log("\u30E6\u30FC\u30B6\u30FC\u306F\u3059\u3067\u306B\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u3044\u307E\u3059\u3002\u901A\u904E\u3092\u8A31\u53EF\u3057\u307E\u3059\u3002");
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // 开发环境免检
      console.log("\u958B\u767A\u74B0\u5883: OpenWrite\u3092\u7121\u52B9\u5316");
      return;
    }

    if (isBrowser && blogId && !isSignedIn) {
      toggleTocItems(true); // 禁止目录项的点击

      // 检查是否已加载
      const readMoreWrap = document.getElementById('read-more-wrap');
      if (!readMoreWrap) {
        loadOpenWrite();
      }
    }
  }, [isLoaded, router]);

  // 启动一个监听器，当页面上存在#read-more-wrap对象时，所有的 a .catalog-item 对象都禁止点击

  return <></>;
};

// 定义禁用和恢复目录项点击的函数
const toggleTocItems = (disable) => {
  const tocItems = document.querySelectorAll('a.catalog-item');
  tocItems.forEach((item) => {
    if (disable) {
      item.style.pointerEvents = 'none';
      item.style.opacity = '0.5';
    } else {
      item.style.pointerEvents = 'auto';
      item.style.opacity = '1';
    }
  });
};

/**
 * 检查路径是否在名单中
 * @param {*} path 当前url的字符串
 * @param {*} listStr 名单字符串，逗号分隔
 */
function isPathInList(path, listStr) {
  if (!path || !listStr) {
    return false;
  }

  // 提取 path 最后一个斜杠后的内容，并移除查询参数和 .html 后缀
  const processedPath = path.
  replace(/\?.*$/, '') // 移除查询参数
  .replace(/.*\/([^/]+)(?:\.html)?$/, '$1'); // 提取最后部分

  const isInList = listStr.includes(processedPath);

  if (isInList) {

    // console.log(`当前路径在名单中: ${processedPath}`)
  }
  return isInList;
}

export default OpenWrite;