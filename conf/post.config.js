/**
 * 記事関連の機能設定
 */
module.exports = {
  // 記事 URL のプレフィックス
  POST_URL_PREFIX: process.env.NEXT_PUBLIC_POST_URL_PREFIX ?? 'article',
  // POST タイプの記事のデフォルトの URL プレフィックス  
  // 例：デフォルトでは /article/[slug] という形式になる  
  // これを空文字 '' にすると、記事 URL にはプレフィックスが付かなくなる  
  // WordPress のパーマリンク構造のようにカスタム形式をサポート  
  // 現在 %year%/%month%/%day% のみ実装済み  
  // 例：article/%year%/%month%/%day% のように設定すれば日付入り URL になる

  POST_SCHEDULE_PUBLISH:
    process.env.NEXT_PUBLIC_NOTION_SCHEDULE_PUBLISH || true,
    // Notion の「公開日時」フィールドに従って、自動で記事を公開・非公開にする

  // シェアバー
  POST_SHARE_BAR_ENABLE: process.env.NEXT_PUBLIC_POST_SHARE_BAR || 'true',
    // 記事下部の共有バーを表示するかどうか

  POSTS_SHARE_SERVICES:
    process.env.NEXT_PUBLIC_POST_SHARE_SERVICES ||
    'link,wechat,qq,weibo,email,facebook,twitter,telegram,messenger,line,reddit,whatsapp,linkedin',
    // 表示する共有サービス（順番通り並ぶ／カンマ区切り）
    // サポートされている共有サービス一覧：  
    // link(リンクコピー), wechat(微信), qq, weibo(微博), email(メール),  
    // facebook, twitter, telegram, messenger, line, reddit, whatsapp, linkedin,  
    // vkshare, okshare, tumblr, livejournal, mailru, viber, workplace, pocket, instapaper, hatena

  POST_TITLE_ICON: process.env.NEXT_PUBLIC_POST_TITLE_ICON || true,
    // タイトル横のアイコンを表示するか

  POST_DISABLE_GALLERY_CLICK:
    process.env.NEXT_PUBLIC_POST_DISABLE_GALLERY_CLICK || false,
    // ギャラリー画像をクリック不可にする（友達リンク用の画像にリンクを付けたい場合に便利）

  POST_LIST_STYLE: process.env.NEXT_PUBLIC_POST_LIST_STYLE || 'page',
    // 記事一覧のスタイル: ['page', 'scroll']  
    // page = ページネーション  
    // scroll = スクロール読み込み

  POST_LIST_PREVIEW: process.env.NEXT_PUBLIC_POST_PREVIEW || true,
    // 一覧ページに記事プレビュー（本文の冒頭）を読み込むか

  POST_PREVIEW_LINES: process.env.NEXT_PUBLIC_POST_POST_PREVIEW_LINES || 12,
    // プレビューとして表示する行数

  POST_RECOMMEND_COUNT: process.env.NEXT_PUBLIC_POST_RECOMMEND_COUNT || 6,
    // 関連記事の表示件数

  POSTS_PER_PAGE: process.env.NEXT_PUBLIC_POST_PER_PAGE || 12,
    // 1ページあたりの記事数

  POSTS_SORT_BY: process.env.NEXT_PUBLIC_POST_SORT_BY || 'notion',
    // 記事の並び順  
    // 'date' = 日付順  
    // 'notion' = Notion 側の並びに従う

  // 記事の「期限切れ」警告機能（※現在 heo テーマのみ対応）
  ARTICLE_EXPIRATION_DAYS:
    process.env.NEXT_PUBLIC_ARTICLE_EXPIRATION_DAYS || 90,
    // 何日経過したら「古い記事」として警告するか（単位：日）

  ARTICLE_EXPIRATION_MESSAGE:
    process.env.NEXT_PUBLIC_ARTICLE_EXPIRATION_MESSAGE ||
    'この記事は %%DAYS%% 日前に公開されました。内容が古い可能性がありますのでご注意ください。',
    // 期限切れ警告メッセージ（%%DAYS%% が日数に置き換わる）

  ARTICLE_EXPIRATION_ENABLED:
    process.env.NEXT_PUBLIC_ARTICLE_EXPIRATION_ENABLED || 'false',
    // 記事の期限切れ警告を有効にするか

  POST_WAITING_TIME_FOR_404:
    process.env.NEXT_PUBLIC_POST_WAITING_TIME_FOR_404 || '8',
    // 記事読み込みタイムアウト秒数  
    // 指定秒数を超えると自動的に 404 ページへ移動

  // タグ関連の設定
  TAG_SORT_BY_COUNT: true,
    // タグを記事数の多い順に並べるか（多いタグが先頭に来る）

  IS_TAG_COLOR_DISTINGUISHED:
    process.env.NEXT_PUBLIC_IS_TAG_COLOR_DISTINGUISHED === 'true' || true
    // 同名タグでも色を区別するかどうか
}
