import { useEffect, useState } from 'react';

export default function RevolverMaps() {
  const [load, changeLoad] = useState(false);
  useEffect(() => {
    if (!load) {
      initRevolverMaps();
      changeLoad(true);
    }
  }, []);
  return <div id="revolvermaps" className='p-4' />;
}

function initRevolverMaps() {
  if (screen.width >= 768) {
    Promise.all([
    loadExternalResource('https://rf.revolvermaps.com/0/0/8.js?i=5jnp1havmh9&amp;m=0&amp;c=ff0000&amp;cr1=ffffff&amp;f=arial&amp;l=33')]
    ).then(() => {
      console.log("\u30DE\u30C3\u30D7\u306E\u8AAD\u307F\u8FBC\u307F\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F");
    });
  }
}

// 封装异步加载资源的方法
function loadExternalResource(url) {
  return new Promise((resolve, reject) => {
    const container = document.getElementById('revolvermaps');
    const tag = document.createElement('script');
    tag.src = url;
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      container.appendChild(tag);
    }
  });
}