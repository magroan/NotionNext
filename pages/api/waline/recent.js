export default async function handler(req, res) {
  const countRaw = req.query.count || '5'
  const count = Math.max(1, Math.min(Number.parseInt(countRaw, 10) || 5, 20))

  const serverURL =
    process.env.WALINE_SERVER_URL ||
    process.env.NEXT_PUBLIC_WALINE_SERVER_URL ||
    'https://comment.asami.chiba.jp'

  const siteURL =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://asami.chiba.jp'

  const base = String(serverURL).replace(/\/$/, '')
  const site = String(siteURL).replace(/\/$/, '')
  const url = `${base}/api/comment?type=recent&count=${count}&_ts=${Date.now()}`

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Origin: site,
        Referer: `${site}/`
      }
    })

    const text = await response.text()
    let payload

    try {
      payload = JSON.parse(text)
    } catch {
      payload = {
        errno: response.ok ? 0 : response.status,
        errmsg: text || response.statusText,
        data: []
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({
        errno: response.status,
        errmsg: payload?.errmsg || response.statusText,
        data: []
      })
    }

    return res.status(200).json(payload)
  } catch (error) {
    return res.status(500).json({
      errno: 500,
      errmsg: error?.message || 'failed to fetch Waline recent comments',
      data: []
    })
  }
}
