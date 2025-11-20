// scripts/fix-css-fences.js
// 誤って挿入された「```css ～ ```」を一括修正するスクリプト
//
// 対象: components, pages, themes, lib 配下の .js/.jsx/.ts/.tsx
// やっていること:
//  - "```css" を "`" に
//  - 残った "```" を "`" に
//
// ※ かなり機械的な置換なので、実行後は git diff で確認してください。

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const GLOBS = [
  "components/**/*.{js,jsx,ts,tsx}",
  "pages/**/*.{js,jsx,ts,tsx}",
  "themes/**/*.{js,jsx,ts,tsx}",
  "lib/**/*.{js,jsx,ts,tsx}",
];

function fixContent(code) {
  let fixed = code;

  // 1. ```css を ` に
  fixed = fixed.replace(/{````css/g, "{`");

  // 2. 残った ``` を ` に
  fixed = fixed.replace(/````/g, "`");

  return fixed;
}

function processFile(file) {
  const full = path.resolve(file);
  const code = fs.readFileSync(full, "utf8");
  const fixed = fixContent(code);
  if (fixed !== code) {
    fs.writeFileSync(full, fixed, "utf8");
    console.log("fixed:", file);
    return true;
  }
  return false;
}

function main() {
  const files = GLOBS.flatMap((pattern) => glob.sync(pattern, { nodir: true }));
  console.log("target files:", files.length);
  let count = 0;
  for (const file of files) {
    if (processFile(file)) count++;
  }
  console.log("modified files:", count);
}

main();

