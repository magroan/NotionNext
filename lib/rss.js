import BLOG from '@/blog.config';
import NotionPage from '@/components/NotionPage';
import { getPostBlocks } from '@/lib/db/getSiteData';
import { Feed } from 'feed';
import fs from 'fs';
import ReactDOMServer from 'react-dom/server';
import { decryptEmail } from '@/lib/plugins/mailEncrypt';

/** 日付を安全にパース（壊れている時は現在日時にフォールバック） */
function safeDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    console.warn('[RSS] Invalid date detected, fallback → now:', value);
    return new Date();
  }
  return d;
}

/**
 * RSS の記事本文を生成
 */
const createFeedContent = async (post) => {
  try {
    if (post.password && post.password !== '') {
      return post.summary;
    }

    const blockMap = await getPostBlocks(post.id, 'rss-content');
    if (!blockMap) return post.summary;

    post.blockMap = blockMap;
    const content = ReactDOMServer.renderToString(<NotionPage post={post} />);

    const regexExp =
      /<div class="notion-collection-row"><div class="notion-collection-row-body"><div class="notion-collection-row-property"><div class="notion-collection-column-title"><svg.*?class="notion-collection-column-title-icon">.*?<\/svg><div class="notion-collection-column-title-body">.*?<\/div><\/div><div class="notion-collection-row-value">.*?<\/div><\/div><\/div><\/div>/g;

    return content.replace(regexExp, '');
  } catch (err) {
    console.error('[RSS] createFeedContent error:', err);
    return post.summary || '';
  }
};

/**
 * RSS 生成
 */
export async function generateRss(props) {
  const { NOTION_CONFIG, siteInfo, latestPosts } = props;

  const TITLE = siteInfo?.title;
  const DESCRIPTION = siteInfo?.description;
  const LINK = siteInfo?.link;
  const AUTHOR = NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR;
  const LANG = NOTION_CONFIG?.LANG || BLOG.LANG;
  const SUB_PATH = NOTION_CONFIG?.SUB_PATH || BLOG.SUB_PATH;

  const CONTACT_EMAIL = decryptEmail(
    NOTION_CONFIG?.CONTACT_EMAIL || BLOG.CONTACT_EMAIL
  );

  if (isFeedRecentlyUpdated('./public/rss/feed.xml', 10)) return;

  console.log('[RSS購読] 生成/rss/feed.xml');

  const year = new Date().getFullYear();

  const feed = new Feed({
    title: TITLE,
    description: DESCRIPTION,
    link: `${LINK}/${SUB_PATH}`,
    language: LANG,
    favicon: `${LINK}/favicon.png`,
    copyright: `All rights reserved ${year}, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: CONTACT_EMAIL,
      link: LINK
    }
  });

  /** 各記事をRSSへ追加 */
  for (const post of latestPosts) {
    try {
      feed.addItem({
        title: post.title,
        link: `${LINK}/${post.slug}`,
        description: post.summary || '',
        content: await createFeedContent(post),
        date: safeDate(post.publishDay || post.publishDate)
      });
    } catch (err) {
      console.error('[RSS] addItem error:', post.slug, err);
    }
  }

  /** ファイル書き込み */
  try {
    fs.mkdirSync('./public/rss', { recursive: true });
    fs.writeFileSync('./public/rss/feed.xml', feed.rss2());
    fs.writeFileSync('./public/rss/atom.xml', feed.atom1());
    fs.writeFileSync('./public/rss/feed.json', feed.json1());
  } catch (error) {
    console.error('[RSS] write error:', error);
  }
}

/**
 * 最近更新されていればスキップ
 */
function isFeedRecentlyUpdated(filePath, intervalMinutes = 60) {
  try {
    const stats = fs.statSync(filePath);
    const now = new Date();
    const lastModified = new Date(stats.mtime);
    const diff = (now - lastModified) / (1000 * 60);
    return diff < intervalMinutes;
  } catch (error) {
    return false;
