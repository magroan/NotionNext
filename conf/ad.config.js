/**
 * 広告再生プラグイン
 */
module.exports = {
  // Google AdSense
  ADSENSE_GOOGLE_ID: process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_ID || '', // Google広告ID（例：ca-pub-xxxxxxxxxxxxxxxx）
  ADSENSE_GOOGLE_TEST: process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_TEST || false, // Google広告テストモード。開発用のテスト広告を取得する https://www.tangly1024.com/article/local-dev-google-adsense
  ADSENSE_GOOGLE_SLOT_IN_ARTICLE:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_IN_ARTICLE || '3806269138', // Google AdSense > 広告 > 広告ユニット > 新規「記事内広告」 の html コード内の data-ad-slot の値
  ADSENSE_GOOGLE_SLOT_FLOW:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_FLOW || '1510444138', // Google AdSense > 広告 > 広告ユニット > 新規「情報フィード広告」
  ADSENSE_GOOGLE_SLOT_NATIVE:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_NATIVE || '4980048999', // Google AdSense > 広告 > 広告ユニット > 新規「ネイティブ広告」
  ADSENSE_GOOGLE_SLOT_AUTO:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_AUTO || '8807314373', // Google AdSense > 広告 > 広告ユニット > 新規「ディスプレイ広告（自動広告）」

  // WWAds（万維広告）
  AD_WWADS_ID: process.env.NEXT_PUBLIC_WWAD_ID || null, // https://wwads.cn/ で作成した WWAds 広告ユニット ID
  AD_WWADS_BLOCK_DETECT: process.env.NEXT_PUBLIC_WWADS_AD_BLOCK_DETECT || false // 広告ブロック検出を有効にするか（有効時、広告枠にテキスト警告を表示） @see https://github.com/bytegravity/whitelist-wwads
}
