#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8')
}

function assertIncludes(file, text) {
  const content = read(file)
  if (!content.includes(text)) {
    throw new Error(`${file} is missing: ${text}`)
  }
}

function main() {
  assertIncludes('components/SmartLink.js', 'normalizeTaxonomyHref')
  assertIncludes('components/SmartLink.js', 'const normalizedHref = normalizeTaxonomyHref(href)')
  assertIncludes('components/SmartLink.js', '<Link href={normalizedHref} {...rest}>')

  const routeFiles = [
    'pages/tag/[tag]/index.js',
    'pages/tag/[tag]/page/[page].js',
    'pages/category/[category]/index.js',
    'pages/category/[category]/page/[page].js'
  ]

  for (const file of routeFiles) {
    assertIncludes(file, 'normalizeTaxonomyValue')
    assertIncludes(file, 'taxonomyFieldMatches')
  }

  assertIncludes('themes/simple/components/ArticleInfo.js', '<SmartLink href={`/category/${post?.category}`}')
  assertIncludes('themes/photo/components/SideBar.js', '<SmartLink href={`/category/${category.name}`}')
  assertIncludes('themes/movie/components/SideBar.js', '<SmartLink href={`/category/${category.name}`}')

  console.log('taxonomy source verification passed')
}

main()
