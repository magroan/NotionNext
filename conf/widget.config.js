/**
 * ページ上に浮かぶウィジェット設定
 */
module.exports = {
  THEME_SWITCH: process.env.NEXT_PUBLIC_THEME_SWITCH || false, // テーマ切替ボタンを表示するか

  // Chatbase チャットボットを表示するか https://www.chatbase.co/
  CHATBASE_ID: process.env.NEXT_PUBLIC_CHATBASE_ID || null,

  // WebwhizAI チャットボット @see https://github.com/webwhiz-ai/webwhiz
  WEB_WHIZ_ENABLED: process.env.NEXT_PUBLIC_WEB_WHIZ_ENABLED || false, // 有効化するか
  WEB_WHIZ_BASE_URL:
    process.env.NEXT_PUBLIC_WEB_WHIZ_BASE_URL || 'https://api.webwhiz.ai', // 自前サーバーも利用可能
  WEB_WHIZ_CHAT_BOT_ID: process.env.NEXT_PUBLIC_WEB_WHIZ_CHAT_BOT_ID || null, // 管理画面で取得した BOT ID

  // Dify チャットボット
  DIFY_CHATBOT_ENABLED: process.env.NEXT_PUBLIC_DIFY_CHATBOT_ENABLED || false,
  DIFY_CHATBOT_BASE_URL: process.env.NEXT_PUBLIC_DIFY_CHATBOT_BASE_URL || '',
  DIFY_CHATBOT_TOKEN: process.env.NEXT_PUBLIC_DIFY_CHATBOT_TOKEN || '',

  // ペット系 Live2D ウィジェット
  WIDGET_PET: process.env.NEXT_PUBLIC_WIDGET_PET || false, // ペットウィジェットを表示するか
  WIDGET_PET_LINK:
    process.env.NEXT_PUBLIC_WIDGET_PET_LINK ||
    'https://cdn.jsdelivr.net/npm/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json', // モデルのURL @see https://github.com/xiazeyu/live2d-widget-models
  WIDGET_PET_SWITCH_THEME:
    process.env.NEXT_PUBLIC_WIDGET_PET_SWITCH_THEME || false, // ペットクリックでテーマ切替するか

  // Spoiler（ネタバレ隠し）機能
  // 例：Notion で [sp]隠したい文字[sp] と記述 → ここに [sp] を設定
  SPOILER_TEXT_TAG: process.env.NEXT_PUBLIC_SPOILER_TEXT_TAG || '',

  // 音楽プレイヤー
  MUSIC_PLAYER: process.env.NEXT_PUBLIC_MUSIC_PLAYER || false, // 音楽プレイヤーを使用するか
  MUSIC_PLAYER_VISIBLE: process.env.NEXT_PUBLIC_MUSIC_PLAYER_VISIBLE || true, 
  // 左下にプレイヤーの表示/切替ボタンを出すか
  // 自動再生 + ボタン非表示 → BGM のように常時再生（停止不可）

  MUSIC_PLAYER_AUTO_PLAY:
    process.env.NEXT_PUBLIC_MUSIC_PLAYER_AUTO_PLAY || false, // 自動再生（モバイルでは無効の場合あり）

  MUSIC_PLAYER_LRC_TYPE: process.env.NEXT_PUBLIC_MUSIC_PLAYER_LRC_TYPE || '0', 
  // 歌詞表示方式：
  // 0: 歌詞なし
  // 1: LRC 文字列
  // 3: LRC ファイル URL（meting では使用不可）

  MUSIC_PLAYER_CDN_URL:
    process.env.NEXT_PUBLIC_MUSIC_PLAYER_CDN_URL ||
    'https://cdn.jsdelivr.net/npm/aplayer@1.10.0/dist/APlayer.min.js',

  MUSIC_PLAYER_ORDER: process.env.NEXT_PUBLIC_MUSIC_PLAYER_ORDER || 'list', 
  // 再生順序：list（順番再生） / random（ランダム）

  MUSIC_PLAYER_AUDIO_LIST: [
    // 音楽リスト（歌詞設定などの詳細は APlayer ドキュメントへ）
    // https://aplayer.js.org/#/zh-Hans/
    {
      name: '風を共に舞う気持ち',
      artist: 'Falcom Sound Team jdk',
      url: 'https://music.163.com/song/media/outer/url?id=731419.mp3',
      cover:
        'https://p2.music.126.net/kn6ugISTonvqJh3LHLaPtQ==/599233837187278.jpg'
    },
    {
      name: '王都グランセル',
      artist: 'Falcom Sound Team jdk',
      url: 'https://music.163.com/song/media/outer/url?id=731355.mp3',
      cover:
        'https://p1.music.126.net/kn6ugISTonvqJh3LHLaPtQ==/599233837187278.jpg'
    }
  ],

  MUSIC_PLAYER_METING: process.env.NEXT_PUBLIC_MUSIC_PLAYER_METING || false, 
  // MetingJS を使用して音楽プラットフォームから歌単を取得
  // 有効化時、上記 MUSIC_PLAYER_AUDIO_LIST を上書き
  // 詳細：https://github.com/metowolf/MetingJS

  MUSIC_PLAYER_METING_SERVER:
    process.env.NEXT_PUBLIC_MUSIC_PLAYER_METING_SERVER || 'netease', 
  // 音楽プラットフォーム：netease / tencent / kugou / xiami / baidu

  MUSIC_PLAYER_METING_ID:
    process.env.NEXT_PUBLIC_MUSIC_PLAYER_METING_ID || '60198', // 歌単ID

  MUSIC_PLAYER_METING_LRC_TYPE:
    process.env.NEXT_PUBLIC_MUSIC_PLAYER_METING_LRC_TYPE || '1', 
  // （非推奨）歌詞タイプ：3 | 1 | 0

  // Facebook ページ ウィジェット
  // @see https://tw.andys.pro/article/add-facebook-fanpage-notionnext
  FACEBOOK_PAGE_TITLE: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_TITLE || null, 
  // サイドバーの Facebook Page widget のタイトル（空文字で非表示）

  FACEBOOK_PAGE: process.env.NEXT_PUBLIC_FACEBOOK_PAGE || null, 
  // Facebook Page のリンク（例：https://www.facebook.com/tw.andys.pro）

  FACEBOOK_PAGE_ID: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || '', 
  // Messenger チャット機能を有効にするための Page ID

  FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '' 
  // Messenger チャット機能のための Facebook App ID
  // 取得：https://developers.facebook.com/
}
