/* eslint-disable react/no-unknown-property */
/**
 * 日本語フォント最適化用 style.js（heo テーマ）
 * 本文は明朝、UI はゴシック
 */
const Style = () => {
  return (
    <style jsx global>{`

      /* ------------------------------
          日本語フォント基本設定
      ------------------------------ */

      /* UI用フォント（ゴシック体） */
      :root {
        --jp-sans: "Noto Sans JP", "Hiragino Kaku Gothic ProN",
                   "Yu Gothic UI", "Meiryo", sans-serif;

        /* 本文用フォント（明朝体） */
        --jp-serif: "Noto Serif JP", "Hiragino Mincho ProN",
                    "Yu Mincho", serif;
      }

      /* Body 全体＝明朝体 */
      body {
        background-color: #f7f9fe;
        font-family: var(--jp-serif);
        line-height: 1.9;
      }

      /* UI 部分（メニューやボタン）をゴシック体に */
      #theme-heo nav,
      #theme-heo header,
      #theme-heo footer,
      #theme-heo .menu-item,
      #theme-heo .tag,
      #theme-heo button,
      #theme-heo input,
      #theme-heo select {
        font-family: var(--jp-sans);
      }

      /* 見出しはゴシック体 */
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--jp-sans);
        font-weight: 700;
      }

      /* Notion本文の見出しはゴシック体 */
      .notion-h1, .notion-h2, .notion-h3,
      .notion-h4, .notion-h5, .notion-h6 {
        font-family: var(--jp-sans) !important;
        font-weight: 700;
      }

      /* Notion本文は明朝体 */
      .notion {
        font-family: var(--jp-serif) !important;
      }


      /* ------------------------------
          既存のテーマ設定（あなたのコード）
      ------------------------------ */

      #theme-heo #announcement-content .notion {
        color: white;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(60, 60, 67, 0.4);
        border-radius: 8px;
        cursor: pointer;
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      #more {
        white-space: nowrap;
      }

      .today-card-cover {
        -webkit-mask-image: linear-gradient(to top, transparent 5%, black 70%);
        mask-image: linear-gradient(to top, transparent 5%, black 70%);
      }

      .recent-top-post-group::-webkit-scrollbar {
        display: none;
      }

      .scroll-hidden::-webkit-scrollbar {
        display: none;
      }

      * {
        box-sizing: border-box;
      }

      /* タグスクロールアニメーション */
      .tags-group-wrapper {
        animation: rowup 60s linear infinite;
      }

      @keyframes rowup {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }

    `}</style>
  );
};

export { Style };
