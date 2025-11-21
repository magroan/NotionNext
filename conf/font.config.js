/**
 * サイトのフォント設定
 */
module.exports = {
  // 本文を明朝系にしたいので、全体は serif ベースに
  // （テーマによっては見出しに sans を使ったりします）
  FONT_STYLE: process.env.NEXT_PUBLIC_FONT_STYLE || 'font-serif font-light',

  // ここを「日本語だけ」の Web フォントに絞る
  FONT_URL: [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;700&display=swap'
  ],

  // フォントの読み込み設定
  FONT_DISPLAY: process.env.NEXT_PUBLIC_FONT_DISPLAY || 'swap',
  FONT_PRELOAD: process.env.NEXT_PUBLIC_FONT_PRELOAD || true,
  // 日本語サイトなので subset も japanese に
  FONT_SUBSET: process.env.NEXT_PUBLIC_FONT_SUBSET || 'japanese',

  // サンセリフ体（見出しなどで使用される可能性あり）
  FONT_SANS: [
    '"Noto Sans JP"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Hiragino Sans"',
    '"Yu Gothic UI"',
    '"YuGothic"',
    '"Meiryo"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Segoe UI"',
    'system-ui',
    'sans-serif',
    '"Apple Color Emoji"'
  ],

  // 明朝系（本文はこちらを優先して使わせたい）
  FONT_SERIF: [
    '"Noto Serif JP"',
    '"Yu Mincho"',
    '"Hiragino Mincho ProN"',
    '"MS PMincho"',
    '"Times New Roman"',
    'Times',
    'serif',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Apple Color Emoji"'
  ],

  FONT_AWESOME:
    process.env.NEXT_PUBLIC_FONT_AWESOME_PATH ||
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
}
