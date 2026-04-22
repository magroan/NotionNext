#!/usr/bin/env node
const baseUrl = process.argv[2] || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3800'
const maxChecks = Number(process.env.SMOKE_MAX_CHECKS || '3')
const allowEmpty = String(process.env.ALLOW_EMPTY_TAXONOMY || 'false') === 'true'

function unique(items) {
  return [...new Set(items)]
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' })
  const text = await res.text()
  return { res, text }
}

function assertOk(url, res, text) {
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`)
  }

  const patterns = [
    '"statusCode":404',
    '<title>404',
    '>404<',
    'This page could not be found'
  ]

  for (const pattern of patterns) {
    if (text.includes(pattern)) {
      throw new Error(`${url} rendered a 404 page`) 
    }
  }
}

function extractLinks(html, prefix) {
  const re = new RegExp(`href=["'](${escapeRegExp(prefix)}[^"'#?<> ]+)["']`, 'g')
  const results = []
  let match

  while ((match = re.exec(html)) !== null) {
    if (match[1] !== prefix) {
      results.push(match[1])
    }
  }

  return unique(results)
}

async function verifyIndex(indexPath) {
  const url = `${baseUrl}${indexPath}`
  const { res, text } = await fetchText(url)
  assertOk(url, res, text)
  return text
}

async function verifyLinkedPages(prefix, html) {
  const links = extractLinks(html, prefix).slice(0, maxChecks)

  if (links.length === 0) {
    if (allowEmpty) {
      console.warn(`warning: no links discovered under ${prefix}`)
      return
    }
    throw new Error(`no links discovered under ${prefix}`)
  }

  for (const link of links) {
    const url = `${baseUrl}${link}`
    const { res, text } = await fetchText(url)
    assertOk(url, res, text)
    console.log(`ok ${url}`)
  }
}

async function main() {
  const tagHtml = await verifyIndex('/tag')
  await verifyLinkedPages('/tag/', tagHtml)

  const categoryHtml = await verifyIndex('/category')
  await verifyLinkedPages('/category/', categoryHtml)

  console.log('taxonomy smoke test passed')
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
