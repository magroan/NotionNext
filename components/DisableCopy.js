import { siteConfig } from '@/lib/config';
import { useEffect } from 'react';

/**
 * 禁止用户拷贝文章的插件
 */
export default function DisableCopy() {
  useEffect(() => {
    if (!JSON.parse(siteConfig('CAN_COPY'))) {
      // 全栈添加禁止复制的样式
      document.getElementsByTagName('html')[0].classList.add('forbid-copy');
      // 监听复制事件
      document.addEventListener('copy', function (event) {
        event.preventDefault(); // 阻止默认复制行为
        alert("\u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\u304C\u3001\u3053\u306E\u30DA\u30FC\u30B8\u306E\u5185\u5BB9\u306F\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093\uFF01");
      });
    }
  }, []);

  return null;
}