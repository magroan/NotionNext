/**
 * サイトのフォント設定（日本語対応版の例）
 */
module.exports = {
  // フォントスタイル: セリフ/サンセリフ + 太さ
  FONT_STYLE: process.env.NEXT_PUBLIC_FONT_STYLE || 'font-sans font-light',

  // 読み込む Web フォント
  FONT_URL: [
    // 見出しなど欧文で Bitter を使いたければ残す
    'https://fonts.googleapis.com/css?family=Bitter:300,400,700&display=swap',

    // 日本語サンセリフ
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',

    // 日本語セリフ
    'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;700&display=swap'
  ],

  // フォント表示の最適化
  FONT_DISPLAY: process.env.NEXT_PUBLIC_FONT_DISPLAY || 'swap',
  FONT_PRELOAD: process.env.NEXT_PUBLIC_FONT_PRELOAD || true,

  // 使用するサブセット（日本語）
  FONT_SUBSET: process.env.NEXT_PUBLIC_FONT_SUBSET || 'japanese',

  // サンセリフ系フォント
  FONT_SANS: [
    '"Noto Sans JP"',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Hiragino Sans"',
    '"Yu Gothic"',
    '"Meiryo"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Helvetica',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"'
  ],

  // セリフ系フォント
  FONT_SERIF: [
    '"Noto Serif JP"',
    '"Yu Mincho"',
    '"Hiragino Mincho ProN"',
    '"MS PMincho"',
    'Bitter',
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
