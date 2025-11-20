const CONFIG = {
  // 首屏信息栏按钮文字
  MAGZINE_HOME_BANNER_ENABLE: true, // 首屏右上角的宣传位
  MAGZINE_HOME_BUTTON: true,
  MAGZINE_HOME_BUTTON_URL: '/about',
  MAGZINE_HOME_BUTTON_TEXT: "\u3082\u3063\u3068\u8A73\u3057\u304F\u77E5\u308B",

  MAGZINE_HOME_HIDDEN_CATEGORY: "\u30A8\u30C3\u30BB\u30A4\u3092\u5171\u6709\u3059\u308B", //不希望在首页展示的文章分类，用英文逗号隔开

  MAGZINE_HOME_TITLE: "\u4ECA\u3059\u3050\u30AA\u30F3\u30E9\u30A4\u30F3\u30D3\u30B8\u30CD\u30B9\u3092\u59CB\u3081\u307E\u3057\u3087\u3046\u3002\u5B8C\u5168\u7121\u6599\u3067\u3059\u3002",
  MAGZINE_HOME_DESCRIPTION:
  "NotionNext\u3092\u5229\u7528\u3057\u3066\u3001\u30D3\u30B8\u30CD\u30B9\u3092\u5275\u9020\u3001\u904B\u55B6\u3001\u62E1\u5927\u3059\u308B\u305F\u3081\u306B\u5FC5\u8981\u306A\u3059\u3079\u3066\u306E\u30C4\u30FC\u30EB\u3068\u30B5\u30DD\u30FC\u30C8\u3092\u624B\u306B\u5165\u308C\u307E\u3057\u3087\u3046\u3002",
  MAGZINE_HOME_TIPS: "AI\u306E\u6642\u4EE3\u304C\u5230\u6765\u3057\u3001\u3053\u308C\u306F\u30B9\u30FC\u30D1\u30FC\u30A4\u30F3\u30C7\u30A3\u30D3\u30B8\u30E5\u30A2\u30EB\u306B\u5C5E\u3059\u308B\u72C2\u4E71\u306E\u5BB4\u3067\u3059\uFF01",

  // 首页底部推荐文章标签, 例如 [推荐] , 最多六篇文章; 若留空白''，则推荐最近更新文章
  MAGZINE_RECOMMEND_POST_TAG: "\u304A\u3059\u3059\u3081",
  MAGZINE_RECOMMEND_POST_COUNT: 6,
  MAGZINE_RECOMMEND_POST_TITLE: "\u304A\u3059\u3059\u3081\u306E\u8A18\u4E8B",
  MAGZINE_RECOMMEND_POST_SORT_BY_UPDATE_TIME: false, // 推荐文章排序，为`true`时将强制按最后修改时间倒序

  // Style
  MAGZINE_RIGHT_PANEL_DARK: process.env.NEXT_PUBLIC_MAGZINE_RIGHT_DARK || false, // 右侧面板深色模式

  MAGZINE_POST_LIST_COVER: true, // 文章列表显示图片封面
  MAGZINE_POST_LIST_PREVIEW: true, // 列表显示文章预览
  MAGZINE_POST_LIST_CATEGORY: true, // 列表显示文章分类
  MAGZINE_POST_LIST_TAG: true, // 列表显示文章标签

  MAGZINE_POST_DETAIL_CATEGORY: true, // 文章显示分类
  MAGZINE_POST_DETAIL_TAG: true, // 文章显示标签

  // 文章页面联系卡
  MAGZINE_SOCIAL_CARD: true, // 是否显示右侧，点击加入社群按钮
  MAGZINE_SOCIAL_CARD_TITLE_1: "\u4EA4\u6D41\u30C1\u30E3\u30F3\u30CD\u30EB",
  MAGZINE_SOCIAL_CARD_TITLE_2: "\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u306E\u30C7\u30A3\u30B9\u30AB\u30C3\u30B7\u30E7\u30F3\u306B\u53C2\u52A0\u3057\u3066\u30B7\u30A7\u30A2\u3059\u308B",
  MAGZINE_SOCIAL_CARD_TITLE_3: "\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u306B\u53C2\u52A0\u3059\u308B\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044",
  MAGZINE_SOCIAL_CARD_URL: 'https://docs.tangly1024.com/article/chat-community',

  // 页脚菜单
  MAGZINE_FOOTER_LINKS: [
  {
    name: "\u30EA\u30F3\u30AF\u96C6",
    menus: [
    {
      title: "Tangly\u306E\u5B66\u7FD2\u30CE\u30FC\u30C8",
      href: 'https://blog.tangly1024.com'
    },
    {
      title: 'NotionNext',
      href: 'https://www.tangly1024.com'
    }]

  },
  {
    name: "\u958B\u767A\u8005",
    menus: [
    { title: 'Github', href: 'https://github.com/tangly1024/NotionNext' },
    {
      title: "\u958B\u767A\u30D8\u30EB\u30D7",
      href: 'https://docs.tangly1024.com/article/how-to-develop-with-notion-next'
    },
    {
      title: "\u6A5F\u80FD\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF",
      href: 'https://github.com/tangly1024/NotionNext/issues/new/choose'
    },
    {
      title: "\u6280\u8853\u8A0E\u8AD6",
      href: 'https://github.com/tangly1024/NotionNext/discussions'
    },
    {
      title: "\u8457\u8005\u306B\u3064\u3044\u3066",
      href: 'https://blog.tangly1024.com/about'
    }]

  },
  {
    name: "\u30B5\u30DD\u30FC\u30C8",
    menus: [
    {
      title: "\u904B\u55B6\u8005\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3",
      href: 'https://docs.tangly1024.com/article/chat-community'
    },
    {
      title: "\u76F8\u8AC7\u3068\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA",
      href: 'https://docs.tangly1024.com/article/my-service'
    },
    {
      title: "\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u30DE\u30CB\u30E5\u30A2\u30EB",
      href: 'https://docs.tangly1024.com/article/my-service'
    },
    {
      title: "\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u624B\u9806",
      href: 'https://docs.tangly1024.com/article/how-to-update-notionnext'
    },
    { title: "SEO\u30D7\u30ED\u30E2\u30FC\u30B7\u30E7\u30F3", href: 'https://seo.tangly1024.com/' }]

  },
  {
    name: "\u30BD\u30EA\u30E5\u30FC\u30B7\u30E7\u30F3",
    menus: [
    { title: "\u30A6\u30A7\u30D6\u30B5\u30A4\u30C8\u4F5C\u6210\u30C4\u30FC\u30EB", href: 'https://www.tangly1024.com/' },
    { title: 'NotionNext', href: 'https://docs.tangly1024.com/about' }]

  }],


  // 旧版本顶部菜单
  MAGZINE_MENU_CATEGORY: true, // 显示分类
  MAGZINE_MENU_TAG: true, // 显示标签
  MAGZINE_MENU_ARCHIVE: true, // 显示归档
  MAGZINE_MENU_SEARCH: true, // 显示搜索

  MAGZINE_WIDGET_TO_TOP: true // 跳回顶部
};
export default CONFIG;