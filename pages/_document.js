// eslint-disable-next-line @next/next/no-document-import-in-page
import BLOG from '@/blog.config';
import Document, { Head, Html, Main, NextScript } from 'next/document';

// 预先设置深色模式的脚本内容
const darkModeScript = `
(function() {
  const darkMode = localStorage.getItem('darkMode')

  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  const defaultAppearance = '${BLOG.APPEARANCE || 'auto'}'

  let shouldBeDark = darkMode === 'true' || darkMode === 'dark'

  if (darkMode === null) {
    if (defaultAppearance === 'dark') {
      shouldBeDark = true
    } else if (defaultAppearance === 'auto') {
      // ダークモードの時間範囲を確認
      const date = new Date()
      const hours = date.getHours()
      const darkTimeStart =${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[0] : 18}
      const darkTimeEnd = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[1] : 6}shouldBeDark = prefersDark || (hours >= darkTimeStart || hours < darkTimeEnd)
    }
  }
  
  // 直ちに HTML 要素のクラスを設定する
  document.documentElement.classList.add(shouldBeDark ? 'dark' : 'light')
})()`;




class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang={BLOG.LANG}>
        <Head>
          {/* 预加载字体 */}
          {BLOG.FONT_AWESOME &&
          <>
              <link
              rel='preload'
              href={BLOG.FONT_AWESOME}
              as='style'
              crossOrigin='anonymous' />

              <link
              rel='stylesheet'
              href={BLOG.FONT_AWESOME}
              crossOrigin='anonymous'
              referrerPolicy='no-referrer' />

            </>
          }

          {/* 预先设置深色模式，避免闪烁 */}
          <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>);

  }
}

export default MyDocument;