// 注: process.env.XX是Vercel的?境?量，配置方式?：https://docs.tangly1024.com/article/how-to-config-notion-next#c4768010ae7d44609b744e79e2f9959a

const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3', // API默??求地址,可以配置成自己的地址例如：https://[xxxxx].notion.site/api/v3
  // Important page_id！！！Duplicate Template from  https://tanghh.notion.site/02ab3b8678004aa69e9e415905ef32a5
  NOTION_PAGE_ID:
    process.env.NOTION_PAGE_ID || '2b0b219f5e518183945deb507bf944fa',
  THEME: process.env.NEXT_PUBLIC_THEME || 'example', // 当前主?，在themes文件?下可找到所有支持的主?；主?名称就是文件?名，例如 example,fukasawa,gitbook,heo,hexo,landing,matery,medium,next,nobelium,plog,simple
  LANG: process.env.NEXT_PUBLIC_LANG || 'ja-JP', // e.g 'zh-CN','en-US'  see /lib/lang.js for more.
  SINCE: process.env.NEXT_PUBLIC_SINCE || 2025, // e.g if leave this empty, current year will be used.

  PSEUDO_STATIC: process.env.NEXT_PUBLIC_PSEUDO_STATIC || false, // ?静?路径，??后所有文章URL都以 .html ?尾。
  NEXT_REVALIDATE_SECOND: process.env.NEXT_PUBLIC_REVALIDATE_SECOND || 60, // 更新?存?隔 ?位(秒)；即?个?面有60秒的?静?期、此期?无?多少次??都不会抓取notion数据；?大??有助于?省Vercel?源、同?提升??速率，但也会使文章更新有延?。
  APPEARANCE: process.env.NEXT_PUBLIC_APPEARANCE || 'auto', // ['light', 'dark', 'auto'], // light 日?模式 ， dark夜?模式， auto根据??和主?自?夜?模式
  APPEARANCE_DARK_TIME: process.env.NEXT_PUBLIC_APPEARANCE_DARK_TIME || [18, 6], // 夜?模式起至??，false???根据??自?切?夜?模式

  AUTHOR: process.env.NEXT_PUBLIC_AUTHOR || 'asami', // ?的昵称 例如 tangly1024
  BIO: process.env.NEXT_PUBLIC_BIO || '情報科の教員', // 作者?介
  LINK: process.env.NEXT_PUBLIC_LINK || 'https://asami.chiba.jp', // 网站地址
  KEYWORDS: process.env.NEXT_PUBLIC_KEYWORD || '情報,高校,情報科,ICT,情報学,DX,教育,情報教育', // 网站??? 英文逗号隔?
  BLOG_FAVICON: process.env.NEXT_PUBLIC_FAVICON || '/favicon.ico', // blog favicon 配置, 默?使用 /public/favicon.ico，支持在??片，如 https://img.imesong.com/favicon.png
  BEI_AN: process.env.NEXT_PUBLIC_BEI_AN || '', // 
  BEI_AN_LINK: process.env.NEXT_PUBLIC_BEI_AN_LINK || '', // ?案???接，如果用了萌?等?案?在?里填写
  BEI_AN_GONGAN: process.env.NEXT_PUBLIC_BEI_AN_GONGAN || '', // 公安?案号，例如 '浙公网安?3xxxxxxxx8号'

  // RSS??
  ENABLE_RSS: process.env.NEXT_PUBLIC_ENABLE_RSS || false, // 是否??RSS??功能

  // 其它??配置
  // 原配置文件??，且并非所有人都会用到，故此将配置拆分到/conf/目?下, 按需找到??文件并修改即可
  ...require('./conf/comment.config'), // ??插件
  ...require('./conf/contact.config'), // 作者?系方式配置
  ...require('./conf/post.config'), // 文章与列表配置
  ...require('./conf/analytics.config'), // 站点????
  ...require('./conf/image.config'), // 网站?片相?配置
  ...require('./conf/font.config'), // 网站字体
  ...require('./conf/right-click-menu'), // 自定?右?菜?相?配置
  ...require('./conf/code.config'), // 网站代???式
  ...require('./conf/animation.config'), // ?效美化效果
  ...require('./conf/widget.config'), // ?浮在网?上的挂件，聊天客服、?物挂件、音?播放器等
  ...require('./conf/ad.config'), // 广告?收插件
  ...require('./conf/plugin.config'), // 其他第三方插件 algolia全文索引
  ...require('./conf/performance.config'), // 性能?化配置

  // 高?用法
  ...require('./conf/layout-map.config'), // 路由与布局映射自定?，例如自定?特定路由的?面布局
  ...require('./conf/notion.config'), // ?取notion数据?相?的?展配置，例如自定?表?
  ...require('./conf/dev.config'), // ??、???需要?注的配置

  // 自定?外部脚本，外部?式
  CUSTOM_EXTERNAL_JS: [''], // e.g. ['http://xx.com/script.js','http://xx.com/script.js']
  CUSTOM_EXTERNAL_CSS: [''], // e.g. ['http://xx.com/style.css','http://xx.com/style.css']

  // 自定?菜?
  CUSTOM_MENU: process.env.NEXT_PUBLIC_CUSTOM_MENU || true, // 支持Menu?型的菜?，替代了3.12版本前的Page?型

  // 文章列表相??置
  CAN_COPY: process.env.NEXT_PUBLIC_CAN_COPY || true, // 是否允??制?面内容 默?允?，如果?置?false、?全?禁止?制内容。

  // ??布局 是否反?(左?右,右?左) 已支持主?: hexo next medium fukasawa example
  LAYOUT_SIDEBAR_REVERSE:
    process.env.NEXT_PUBLIC_LAYOUT_SIDEBAR_REVERSE || false,

  // ?迎?打字效果,Hexo,Matery主?支持, 英文逗号隔?多个?迎?。
  GREETING_WORDS:
    process.env.NEXT_PUBLIC_GREETING_WORDS ||
    '情報教育を頑張りたい人が趣味で更新しているWebサイト',

  // uuid重定向至 slug
  UUID_REDIRECT: process.env.UUID_REDIRECT || false
}

module.exports = BLOG
