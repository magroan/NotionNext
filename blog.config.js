// 注: process.env.XX は Vercel の環境変数です。設定方法：
// https://docs.tangly1024.com/article/how-to-config-notion-next#c4768010ae7d44609b744e79e2f9959a

const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3', 
  // API のデフォルトリクエスト先。独自 URL（例：https://[xxxxx].notion.site/api/v3）にも変更可能。
  IS_SHOW_ARTICLE_EMBED: true,

  // 重要：page_id！！ テンプレートを以下から複製して使用：
  // https://tanghh.notion.site/02ab3b8678004aa69e9e415905ef32a5
  NOTION_PAGE_ID:
    process.env.NOTION_PAGE_ID || '2b0b219f5e518183945deb507bf944fa',

  THEME: process.env.NEXT_PUBLIC_THEME || 'example', 
  // 現在のテーマ。themes フォルダ内に存在するテーマ名を指定。
  // 例：example, fukasawa, gitbook, heo, hexo, landing, matery, medium, next, nobelium, plog, simple

  LANG: process.env.NEXT_PUBLIC_LANG || 'ja-JP', 
  // 言語（例：'zh-CN', 'en-US'）。詳細は /lib/lang.js を参照。

  SINCE: process.env.NEXT_PUBLIC_SINCE || 2025, 
  // サイト開始年。空にすると自動的に現在の年が使用される。

  PSEUDO_STATIC: process.env.NEXT_PUBLIC_PSEUDO_STATIC || false, 
  // 疑似静的パス。true にすると全ての URL の末尾に .html を付与。

  NEXT_REVALIDATE_SECOND: process.env.NEXT_PUBLIC_REVALIDATE_SECOND || 60, 
  // 再検証間隔（秒）。
  // 例：60秒間は Notion データを再取得しない → Vercel のリソース節約＋高速表示
  // ただし記事更新反映に遅延が生じる。

  APPEARANCE: process.env.NEXT_PUBLIC_APPEARANCE || 'light', 
  // 外観テーマ ['light', 'dark', 'auto']
  // light = 昼モード / dark = 夜モード / auto = デバイス設定または時間帯に応じて切替

  APPEARANCE_DARK_TIME: process.env.NEXT_PUBLIC_APPEARANCE_DARK_TIME || [18, 6], 
  // 夜モードの時間帯（開始, 終了）。false でデバイス設定に従う。

  AUTHOR: process.env.NEXT_PUBLIC_AUTHOR || '@_asami', 
  // 著者名

  BIO: process.env.NEXT_PUBLIC_BIO || '情報科の教員', 
  // 著者プロフィール

  LINK: process.env.NEXT_PUBLIC_LINK || 'https://asami.chiba.jp', 
  // Web サイトのURL

  KEYWORDS: process.env.NEXT_PUBLIC_KEYWORD || '情報,高校,情報科,ICT,情報学,DX,教育,情報教育', 
  // サイト SEO 用キーワード（カンマ区切り）

  BLOG_FAVICON: process.env.NEXT_PUBLIC_FAVICON || '/favicon.ico', 
  // Favicon。外部画像URLも指定可能（例：https://img.imesong.com/favicon.png）

  BEI_AN: process.env.NEXT_PUBLIC_BEI_AN || '', 
  // （中国向け）ICP登録番号

  BEI_AN_LINK: process.env.NEXT_PUBLIC_BEI_AN_LINK || '', 
  // ICP 登録ページリンク（萌国备案等を使用する場合など）

  BEI_AN_GONGAN: process.env.NEXT_PUBLIC_BEI_AN_GONGAN || '', 
  // 公安备案番号（例：浙公网安备xxxxxxxxxxx号）

  // RSS 配信
  ENABLE_RSS: process.env.NEXT_PUBLIC_ENABLE_RSS || true, 
  // RSS 機能の有効化

  // その他の詳細設定（conf フォルダへ分割されている）
  ...require('./conf/comment.config'), // コメント機能
  ...require('./conf/contact.config'), // 著者連絡先
  ...require('./conf/post.config'), // 記事 & 一覧設定
  ...require('./conf/analytics.config'), // サイト解析
  ...require('./conf/image.config'), // 画像設定
  ...require('./conf/font.config'), // フォント設定
  ...require('./conf/right-click-menu'), // 右クリックメニュー
  ...require('./conf/code.config'), // コード表示設定
  ...require('./conf/animation.config'), // アニメーション設定
  ...require('./conf/widget.config'), // 浮動ウィジェット（チャット、マスコット、音楽プレイヤー 等）
  ...require('./conf/ad.config'), // 広告収益プラグイン
  ...require('./conf/plugin.config'), // その他プラグイン（Algolia全文検索など）
  ...require('./conf/performance.config'), // パフォーマンス設定

  // 高度な設定
  ...require('./conf/layout-map.config'), 
  // ルートとレイアウトのマッピング（特定ページのレイアウトをカスタム）

  ...require('./conf/notion.config'), 
  // Notion データ取得関連の拡張設定（カスタムテーブルなど）

  ...require('./conf/dev.config'), 
  // 開発・デバッグ用設定

  // 外部 JavaScript / CSS の読み込み
  CUSTOM_EXTERNAL_JS: [''], 
  CUSTOM_EXTERNAL_CSS: [''],

  // カスタムメニュー
  CUSTOM_MENU: process.env.NEXT_PUBLIC_CUSTOM_MENU || true, 
  // Menu 型のカスタムメニュー。3.12 以前の Page 型を置き換え。

  // 記事のコピー可否
  CAN_COPY: process.env.NEXT_PUBLIC_CAN_COPY || true, 
  // true = コピー許可 / false = 全面コピー禁止

  // レイアウト左右反転（左→右、右→左）
  // 対応テーマ：hexo, next, medium, fukasawa, example
  LAYOUT_SIDEBAR_REVERSE:
    process.env.NEXT_PUBLIC_LAYOUT_SIDEBAR_REVERSE || false,

  // トップのウェルカムメッセージ（打ち込みアニメーション）
  // Hexo, Matery テーマ対応 / カンマ区切りで複数指定可
  GREETING_WORDS:
    process.env.NEXT_PUBLIC_GREETING_WORDS ||
    '情報教育を頑張りたい人が趣味で更新しているWebサイト',

  // UUID を slug へリダイレクトするか
  UUID_REDIRECT: process.env.UUID_REDIRECT || false
}

module.exports = BLOG
