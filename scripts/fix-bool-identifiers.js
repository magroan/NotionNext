// scripts/fix-bool-identifiers.js
// 誤って挿入された False / True を一括修正するスクリプト
//
// 対象: components, pages, themes, lib 配下の .js/.jsx/.ts/.tsx
// やっていること:
//  - コード中の識別子としての "False" を "false" に
//  - 識別子としての "True" を "true" に
//
// 文字列リテラル（"False" や 'False'）は出来るだけ触らないよう、雑ですが簡単な判定を入れています。

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
  // かなり単純なトークナイザ：ダブル/シングル/バッククォートで囲まれた部分はスキップし、
  // それ以外で単語として現れる False / True を置換します。
  let result = "";
  let i = 0;
  const len = code.length;
  let inString = false;
  let stringChar = null;
  let escape = false;

  while (i < len) {
    const ch = code[i];

    if (inString) {
      result += ch;

      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === stringChar) {
        inString = false;
        stringChar = null;
      }

      i++;
      continue;
    }

    // 文字列の開始
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = true;
      stringChar = ch;
      result += ch;
      i++;
      continue;
    }

    // 単語境界の開始かどうか
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      let word = "";

      while (j < len && /[A-Za-z0-9_]/.test(code[j])) {
        word += code[j];
        j++;
      }

      if (word === "False") {
        result += "false";
      } else if (word === "True") {
        result += "true";
      } else {
        result += word;
      }

      i = j;
      continue;
    }

    // それ以外はそのまま
    result += ch;
    i++;
  }

  return result;
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

