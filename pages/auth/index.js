// pages/sitemap.xml.js
import { getGlobalData } from '@/lib/db/getSiteData';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Slug from '../[prefix]';

/**
 * 根据notion的slug访问页面
 * 解析二级目录 /article/about
 * @param {*} props
 * @returns
 */
const UI = (props) => {
  const { redirect_pathname, redirect_query } = props;
  const router = useRouter();
  useEffect(() => {
    router?.push({ pathname: redirect_pathname, query: redirect_query });
  }, []);
  return <Slug {...props} />;
};

/**
 * 服务端接收参数处理
 * @param {*} ctx
 * @returns
 */
export const getServerSideProps = async (ctx) => {
  const from = `auth`;
  const props = await getGlobalData({ from });
  delete props.allPages;
  const code = ctx.query.code;

  let params = null;
  if (code) {
    params = await fetchToken(code);
  }

  // 授权成功的划保存下用户的workspace信息
  if (params?.status === 200) {
    console.log("\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u6210\u529F\u3057\u307E\u3057\u305F", params);
    props.redirect_query = {
      ...params.data,
      msg: "\u6210\u529F\u3057\u307E\u3057\u305F" + JSON.stringify(params.data)
    };
    console.log("\u30E6\u30FC\u30B6\u30FC\u60C5\u5831", JSON.stringify(params.data));
  } else if (!params) {
    console.log("\u30EA\u30AF\u30A8\u30B9\u30C8\u306B\u7570\u5E38\u304C\u767A\u751F\u3057\u307E\u3057\u305F", params);
    props.redirect_query = { msg: "\u7121\u52B9\u306A\u30EA\u30AF\u30A8\u30B9\u30C8" };
  } else {
    console.log("\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u5931\u6557\u3057\u307E\u3057\u305F", params);
    props.redirect_query = { msg: params.statusText };
  }

  props.redirect_pathname = '/auth/result';

  return {
    props
  };
};

const fetchToken = async (code) => {
  if (!code) {
    return "\u7121\u52B9\u306A\u30EA\u30AF\u30A8\u30B9\u30C8";
  }
  console.log('Auth', code);
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;

  // encode in base 64
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    console.log(
      `コードをリクエストしてトークンを取得します。${clientId}:${clientSecret} -- ${redirectUri}`
    );
    const response = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${encoded}`
        }
      }
    );

    console.log('Token response', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching token', error);
  }
};

export default UI;