/* eslint-disable react/no-unknown-property */
/**
 * 这里的css样式只对当前主题生效
 * 主题客制化css
 * @returns
 */
const Style = () => {
  return <style jsx global>{`// 背景色
    body{
        background-color: #f5f5f5
    }
    .dark body{
        background-color: black;
    }

    // 商品紹介エリアのフォントサイズを拡大
    #brand-introduction .notion {
        font-size: 1.5rem !important;
    }
  
    /* メニュー下線アニメーション */
    #theme-commerce .menu-link {
        text-decoration: none;
        background-image: linear-gradient(#D2232A, #D2232A);
        background-repeat: no-repeat;
        background-position: bottom center;
        background-size: 0 2px;
        transition: background-size 100ms ease-in-out;
    }
    
    #theme-commerce .menu-link:hover {
        background-size: 100% 2px;
        color: #D2232A;
    }

    /* 上から下へのグラデーション黒色を設定 */
    #theme-commerce .header-cover::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:  linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.5) 100%);
    }

    /* カスタム */
    .tk-footer{
        opacity: 0;
    }

    // 選択されたフォントの色
    ::selection {
        background: rgba(45, 170, 219, 0.3);
    }

    // カスタムスクロールバー
    ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #D2232A;
    }

    * {
        scrollbar-width:thin;
        scrollbar-color: #D2232A transparent
    }`



    }</style>;
};

export { Style };