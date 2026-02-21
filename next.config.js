const fs = require('fs')
const path = require('path')
const BLOG = require('./blog.config')
const { THEME } = BLOG
const { extractLangPrefix } = require('./lib/utils/pageId')

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: BLOG.BUNDLE_ANALYZER
})

/**
 * Scan themes directory
 */
function scanSubdirectories(directory) {
  const subdirectories = []
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file)
    const stats = fs.statSync(fullPath)
    if (stats.isDirectory()) {
      subdirectories.push(file)
    }
  })
  return subdirectories
}

// themes list (for UI / config)
const themes = scanSubdirectories(path.resolve(__dirname, 'themes'))

/**
 * Supported locales
 * BLOG.NOTION_PAGE_ID can be:
 *   "xxxx"
 *   "xxxx,zh-CN:yyyy,en:zzzz,ja-JP:aaaa"
 */
const locales = (function () {
  const langs = [BLOG.LANG]
  if (typeof BLOG.NOTION_PAGE_ID === 'string' && BLOG.NOTION_PAGE_ID.includes(',')) {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    for (const siteId of siteIds) {
      const prefix = extractLangPrefix(siteId)
      if (prefix && !langs.includes(prefix)) {
        langs.push(prefix)
      }
    }
  }
  return langs
})()

/**
 * Pre-build cleanup (only for build/export)
 * - Remove old sitemap.xml that can conflict with /pages/sitemap.xml.js
 */
;(function preBuildCleanup() {
  const lifecycle = process.env.npm_lifecycle_event || ''
  const shouldRun = lifecycle === 'build' || lifecycle === 'export'
  if (!shouldRun) return

  const sitemapPath = path.resolve(__dirname, 'public', 'sitemap.xml')
  if (fs.existsSync(sitemapPath)) {
    fs.unlinkSync(sitemapPath)
    console.log('[preBuild] Deleted public/sitemap.xml')
  }

  const sitemap2Path = path.resolve(__dirname, 'sitemap.xml')
  if (fs.existsSync(sitemap2Path)) {
    fs.unlinkSync(sitemap2Path)
    console.log('[preBuild] Deleted ./sitemap.xml')
  }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },

  output: process.env.EXPORT
    ? 'export'
    : process.env.NEXT_BUILD_STANDALONE === 'true'
      ? 'standalone'
      : undefined,

  staticPageGenerationTimeout: 120,

  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  swcMinify: true,

  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}'
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}'
    }
  },

  /**
   * i18n:
   * - EXPORT時は無効（Nextの制約）
   * - localeDetection を false にして、意図しない /ja-JP リダイレクトを抑止（運用が安定）
   */
  i18n: process.env.EXPORT
    ? undefined
    : {
        defaultLocale: BLOG.LANG,
        locales,
        localeDetection: false
      },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'gravatar.com',
      'www.notion.so',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'p1.qhimg.com',
      'webmention.io',
      'ko-fi.com'
    ],
    loader: 'default',
    minimumCacheTTL: 60 * 60 * 24 * 7,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  redirects: process.env.EXPORT
    ? undefined
    : async () => [
        { source: '/feed', destination: '/rss/feed.xml', permanent: true }
      ],

  /**
   * IMPORTANT:
   * 以前の `/:locale(...)/:path* -> /:path*` は NotionNext の `[prefix]` ルートと衝突し、
   * /ja-JP/about が /about に化けて prefix="about" 扱いになり全ページ404になります。
   * ここでは .html 互換だけ残します。
   */
  rewrites: process.env.EXPORT
    ? undefined
    : async () => [
        {
          source: '/:path*.html',
          destination: '/:path*'
        }
      ],

  headers: process.env.EXPORT
    ? undefined
    : async () => [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value:
                'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
            }
          ]
        }
      ],

  webpack: (config, { dev, isServer }) => {
    // alias
    config.resolve.alias['@'] = path.resolve(__dirname)

    if (!isServer) {
      console.log('[默认主题]', path.resolve(__dirname, 'themes', THEME))
    }
    config.resolve.alias['@theme-components'] = path.resolve(
      __dirname,
      'themes',
      THEME
    )

    // prod optimization
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true
            }
          }
        }
      }
    }

    // dev sourcemap
    if (dev || process.env.NODE_ENV_API === 'development') {
      config.devtool = 'eval-source-map'
    }

    // module resolve
    config.resolve.modules = [path.resolve(__dirname, 'node_modules'), 'node_modules']

    return config
  },

  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ['@heroicons/react', 'lodash']
  },

  exportPathMap: function (defaultPathMap) {
    // export時の衝突回避
    const pages = { ...defaultPathMap }
    delete pages['/sitemap.xml']
    delete pages['/auth']
    return pages
  },

  publicRuntimeConfig: {
    THEMES: themes
  }
}

module.exports = process.env.ANALYZE ? withBundleAnalyzer(nextConfig) : nextConfig
