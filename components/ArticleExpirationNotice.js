import { siteConfig } from '@/lib/config';

/**
 * 文章过期提醒组件
 * 当文章超过指定天数时显示提醒
 * @param {Object} props - 组件属性
 * @param {Object} props.post - 文章数据
 * @param {number} [props.daysThreshold=90] - 过期阈值（天）
 * @returns {JSX.Element|null}
 */
export default function ArticleExpirationNotice({
  post,
  daysThreshold = siteConfig('ARTICLE_EXPIRATION_DAYS', 90)
}) {
  const articleExpirationEnabled = siteConfig(
    'ARTICLE_EXPIRATION_ENABLED',
    false
  );
  if (!articleExpirationEnabled || !post?.lastEditedDay) {
    return null;
  }

  const postDate = new Date(post.lastEditedDay);
  const today = new Date();
  const diffTime = Math.abs(today - postDate);
  const daysOld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isVisible = daysOld >= daysThreshold;

  if (!isVisible) {
    return null;
  }

  // 使用 %%DAYS%% 作为占位符
  const articleExpirationMessage = siteConfig(
    'ARTICLE_EXPIRATION_MESSAGE',
    "\u3053\u306E\u8A18\u4E8B\u306F%%DAYS%%\u65E5\u524D\u306B\u516C\u958B\u3055\u308C\u307E\u3057\u305F\u3002\u5185\u5BB9\u304C\u53E4\u304F\u306A\u3063\u3066\u3044\u308B\u53EF\u80FD\u6027\u304C\u3042\u308B\u305F\u3081\u3001\u614E\u91CD\u306B\u3054\u53C2\u7167\u304F\u3060\u3055\u3044\u3002"
  );
  const articleExpirationMessageParts =
  articleExpirationMessage.split('%%DAYS%%');

  // 直接返回 JSX 内容
  return (
    <div
      className={
      'p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 text-gray-800 dark:text-gray-200 shadow-sm'
      }>
      <div className='flex items-start'>
        <i className='fas fa-exclamation-triangle text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0' />
        <div className='ml-1'>
          <div className='text-blue-600 dark:text-blue-400 font-medium'>
            {siteConfig('ARTICLE_EXPIRATION_TITLE', "\u6E29\u304B\u3044\u304A\u77E5\u3089\u305B")}
          </div>
          <div className='flex items-center mt-1 text-sm text-gray-700 dark:text-gray-300'>
            <i className='far fa-clock text-red-500 dark:text-red-400 mr-1' />
            <span>
              {(() => {
                return (
                  <>
                    {articleExpirationMessageParts[0]}
                    <span className='text-red-500 dark:text-red-400 font-bold'>
                      {daysOld}
                    </span>
                    {articleExpirationMessageParts[1]}
                  </>);

              })()}
            </span>
          </div>
        </div>
      </div>
    </div>);

}