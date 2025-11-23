/**
 * コメントウィジェットに関する設定
 * WALINE / VALINE / GISCUS / CUSDIS / UTTERANCES / GITALK など複数のコメントシステムを同時に有効化できる
 */
module.exports = {
  COMMENT_HIDE_SINGLE_TAB:
    process.env.NEXT_PUBLIC_COMMENT_HIDE_SINGLE_TAB || false,
    // タブが 1 種類しかない場合、タブ切り替えの見出しを非表示にするかどうか

  // Artalk コメントプラグイン
  COMMENT_ARTALK_SERVER: process.env.NEXT_PUBLIC_COMMENT_ARTALK_SERVER || '',
    // Artalk サーバー側のアドレス https://artalk.js.org/guide/deploy.html
  COMMENT_ARTALK_JS:
    process.env.NEXT_PUBLIC_COMMENT_ARTALK_JS ||
    'https://cdnjs.cloudflare.com/ajax/libs/artalk/2.5.5/Artalk.js',
    // Artalk の JS CDN
  COMMENT_ARTALK_CSS:
    process.env.NEXT_PUBLIC_COMMENT_ARTALK_CSS ||
    'https://cdnjs.cloudflare.com/ajax/libs/artalk/2.5.5/Artalk.css',
    // Artalk の CSS CDN

  // Twikoo
  COMMENT_TWIKOO_ENV_ID: process.env.NEXT_PUBLIC_COMMENT_ENV_ID || '',
    // Twikoo のバックエンドアドレス  
    // Tencent Cloud では envId、Vercel ではドメイン名を入力  
    // チュートリアル：https://tangly1024.com/article/notionnext-twikoo
  COMMENT_TWIKOO_COUNT_ENABLE:
    process.env.NEXT_PUBLIC_COMMENT_TWIKOO_COUNT_ENABLE || false,
    // ブログ一覧ページにコメント数を表示するかどうか
  COMMENT_TWIKOO_CDN_URL:
    process.env.NEXT_PUBLIC_COMMENT_TWIKOO_CDN_URL ||
    'https://s4.zstatic.net/npm/twikoo@1.6.44/dist/twikoo.min.js',
    // Twikoo のフロントエンド CDN

  // Utterances
  COMMENT_UTTERRANCES_REPO:
    process.env.NEXT_PUBLIC_COMMENT_UTTERRANCES_REPO || '',
    // あなたの GitHub リポジトリ名。例：'tangly1024/NotionNext'  
    // 詳細：https://utteranc.es/

  // Giscus @see https://giscus.app/
  COMMENT_GISCUS_REPO: process.env.NEXT_PUBLIC_COMMENT_GISCUS_REPO || '',
    // あなたの GitHub リポジトリ名 e.g. 'tangly1024/NotionNext'
  COMMENT_GISCUS_REPO_ID: process.env.NEXT_PUBLIC_COMMENT_GISCUS_REPO_ID || '',
    // あなたの GitHub Repo ID（Giscus 設定時に表示される）
  COMMENT_GISCUS_CATEGORY_ID:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_CATEGORY_ID || '',
    // GitHub Discussions の Category ID（Giscus 設定時に表示）
  COMMENT_GISCUS_MAPPING:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_MAPPING || 'pathname',
    // どの方法で記事をマッピングするか（既定：pathname）
  COMMENT_GISCUS_REACTIONS_ENABLED:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_REACTIONS_ENABLED || '1',
    // リアクション（絵文字）を有効化するか（1=有効、0=無効）
  COMMENT_GISCUS_EMIT_METADATA:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_EMIT_METADATA || '0',
    // メタデータの取得を有効にするか（1=有効）
  COMMENT_GISCUS_INPUT_POSITION:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_INPUT_POSITION || 'bottom',
    // コメント入力欄の位置（bottom=下部、top=上部）
  COMMENT_GISCUS_LANG: process.env.NEXT_PUBLIC_COMMENT_GISCUS_LANG || 'ja',
    // Giscus の言語 e.g. 'en', 'zh-TW', 'ja' など
  COMMENT_GISCUS_LOADING:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_LOADING || 'lazy',
    // Giscus の読み込み方式（lazy＝遅延読み込み）
  COMMENT_GISCUS_CROSSORIGIN:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_CROSSORIGIN || 'anonymous',
    // クロスオリジン設定（通常 'anonymous'）

  COMMENT_CUSDIS_APP_ID: process.env.NEXT_PUBLIC_COMMENT_CUSDIS_APP_ID || '',
    // Cusdis の data-app-id（36桁）
  COMMENT_CUSDIS_HOST:
    process.env.NEXT_PUBLIC_COMMENT_CUSDIS_HOST || 'https://cusdis.com',
    // Cusdis の data-host（自前ホストの場合変更）
  COMMENT_CUSDIS_SCRIPT_SRC:
    process.env.NEXT_PUBLIC_COMMENT_CUSDIS_SCRIPT_SRC || '/js/cusdis.es.js',
    // Cusdis の script src（自前ホストの場合変更）

  // Gitalk コメントプラグイン（詳細: https://gitalk.github.io/）
  COMMENT_GITALK_REPO: process.env.NEXT_PUBLIC_COMMENT_GITALK_REPO || '',
    // あなたの GitHub リポジトリ名
  COMMENT_GITALK_OWNER: process.env.NEXT_PUBLIC_COMMENT_GITALK_OWNER || '',
    // GitHub のユーザー名
  COMMENT_GITALK_ADMIN: process.env.NEXT_PUBLIC_COMMENT_GITALK_ADMIN || '',
    // 管理者ユーザー名（通常は自分）
  COMMENT_GITALK_CLIENT_ID:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_CLIENT_ID || '',
    // Gitalk の Client ID（Gitalk 管理画面で取得）
  COMMENT_GITALK_CLIENT_SECRET:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_CLIENT_SECRET || '',
    // Gitalk の Client Secret
  COMMENT_GITALK_DISTRACTION_FREE_MODE: false,
    // Facebook のような集中モード（UI をシンプルにする）
  COMMENT_GITALK_JS_CDN_URL:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_JS_CDN_URL ||
    'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js',
    // Gitalk の JS CDN
  COMMENT_GITALK_CSS_CDN_URL:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_CSS_CDN_URL ||
    'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css',
    // Gitalk の CSS CDN

  COMMENT_GITTER_ROOM: process.env.NEXT_PUBLIC_COMMENT_GITTER_ROOM || '',
    // Gitter チャットルーム（空欄でOK）
  COMMENT_DAO_VOICE_ID: process.env.NEXT_PUBLIC_COMMENT_DAO_VOICE_ID || '',
    // DaoVoice（チャットツール）設定 ID
  COMMENT_TIDIO_ID: process.env.NEXT_PUBLIC_COMMENT_TIDIO_ID || '',
    // Tidio の ID（例：code.tidio.co/[tidio_id].js）

  COMMENT_VALINE_CDN:
    process.env.NEXT_PUBLIC_VALINE_CDN ||
    'https://unpkg.com/valine@1.5.1/dist/Valine.min.js',
  COMMENT_VALINE_APP_ID: process.env.NEXT_PUBLIC_VALINE_ID || '',
    // Valine の APP ID
  COMMENT_VALINE_APP_KEY: process.env.NEXT_PUBLIC_VALINE_KEY || '',
  COMMENT_VALINE_SERVER_URLS: process.env.NEXT_PUBLIC_VALINE_SERVER_URLS || '',
    // 中国国内でカスタムドメインを使う場合の設定（海外版は自動検出）
  COMMENT_VALINE_PLACEHOLDER:
    process.env.NEXT_PUBLIC_VALINE_PLACEHOLDER || '気軽にコメントしてね?',
    // プレースホルダー（管理パネル連携でコメント確認・通知が可能）

  COMMENT_WALINE_SERVER_URL: process.env.NEXT_PUBLIC_WALINE_SERVER_URL || '',
    // Waline の完全なサーバーURL（例：https://preview-waline.tangly1024.com）
  COMMENT_WALINE_RECENT: process.env.NEXT_PUBLIC_WALINE_RECENT || false,
    // 最新コメントの表示

  /**
   * WebMention ベースのコメントシステム
   * Webmention.io 参照：https://webmention.io
   *
   * IndieWeb の思想に基づくオープンなコメントシステム。
   * 以下の設定が必要：
   * ENABLE: 有効化するかどうか
   * AUTH: IndieLogin（Twitter or GitHub のプロフィールでログイン）
   * HOSTNAME: Webmention が紐づくドメイン（通常は自サイト）
   * TWITTER_USERNAME: コメント欄で使用する Twitter 情報
   * TOKEN: Webmention の API トークン
   */
  COMMENT_WEBMENTION_ENABLE: process.env.NEXT_PUBLIC_WEBMENTION_ENABLE || false,
  COMMENT_WEBMENTION_AUTH: process.env.NEXT_PUBLIC_WEBMENTION_AUTH || '',
  COMMENT_WEBMENTION_HOSTNAME:
    process.env.NEXT_PUBLIC_WEBMENTION_HOSTNAME || '',
  COMMENT_WEBMENTION_TWITTER_USERNAME:
    process.env.NEXT_PUBLIC_TWITTER_USERNAME || '',
  COMMENT_WEBMENTION_TOKEN: process.env.NEXT_PUBLIC_WEBMENTION_TOKEN || ''
}
