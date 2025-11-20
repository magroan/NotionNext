require("dotenv").config();


// scripts/zh2ja.js
// 中国語 -> 日本語 自動翻訳 & 置換スクリプト（NotionNext 用）
//
// 依存:
//   npm i -D @babel/parser @babel/traverse @babel/generator glob
//
// 使い方:
//   OPENAI_API_KEY=... node scripts/zh2ja.js
//   （.env.local に書いているなら dotenv を噛ませるか、シェルで export してください）

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY がセットされていません。");
  process.exit(1);
}

// Node18+ なら fetch はグローバルに存在します
if (typeof fetch !== "function") {
  console.error("ERROR: Node.js 18 以上で実行してください（fetch が必要です）。");
  process.exit(1);
}

// 対象ファイルのグロブパターン
const GLOBS = [
  "components/**/*.{js,jsx,ts,tsx}",
  "pages/**/*.{js,jsx,ts,tsx}",
  "themes/**/*.{js,jsx,ts,tsx}",
  "lib/**/*.{js,jsx,ts,tsx}",
  "docs/**/*.{js,jsx,ts,tsx,md,mdx}"
];

// 中国語を含むかどうかのざっくり判定
const hasChinese = (text) => /[\u4E00-\u9FFF]/.test(text);

// キャッシュファイル
const CACHE_PATH = path.join(__dirname, "zh-ja-cache.json");
let cache = {};
if (fs.existsSync(CACHE_PATH)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch (e) {
    console.warn("警告: zh-ja-cache.json の読み込みに失敗しました。新しく作りなおします。");
    cache = {};
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

// 単一文字列を OpenAI で翻訳
async function translateOne(text) {
  if (cache[text]) {
    return cache[text];
  }

  console.log(` 翻訳中: "${text}"`);

  const body = {
    model: "gpt-4o-mini", // 好きなモデル名に変更可
    messages: [
      {
        role: "system",
        content:
          "You are a professional translator. Translate Chinese UI text into natural Japanese. " +
          "Keep HTML tags, punctuation, and variables such as {name}, %s, ${...} unchanged. " +
          "Return ONLY the Japanese text without explanations."
      },
      {
        role: "user",
        content: text
      }
    ]
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("OpenAI API エラー:", res.status, errText);
    throw new Error("OpenAI API error");
  }

  const data = await res.json();
  const ja = (data.choices?.[0]?.message?.content || "").trim();

  if (!ja) {
    throw new Error("翻訳結果が空です");
  }

  cache[text] = ja;
  saveCache();
  console.log(`  -> "${ja}"`);
  return ja;
}

// 複数テキストを順次翻訳（重複排除）
async function translateAll(texts) {
  const result = {};
  for (const t of texts) {
    try {
      const ja = await translateOne(t);
      result[t] = ja;
      // API 制限に引っかかる場合はここで少し待つ
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error("翻訳失敗:", t, e.message);
    }
  }
  return result;
}

// ファイル1つを処理
async function processFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"]
  });

  const textsToTranslate = new Set();

  // 1st pass: 中国語文字列を収集
  traverse(ast, {
    StringLiteral(pathNode) {
      const value = pathNode.node.value;
      if (hasChinese(value)) {
        textsToTranslate.add(value);
      }
    },
    TemplateLiteral(pathNode) {
      pathNode.node.quasis.forEach((q) => {
        const raw = q.value.cooked ?? q.value.raw;
        if (hasChinese(raw)) {
          textsToTranslate.add(raw);
        }
      });
    }
  });

  if (textsToTranslate.size === 0) {
    return false; // 変更なし
  }

  console.log(`\n=== ${filePath} ===`);
  const translateMap = await translateAll(textsToTranslate);

  // 2nd pass: AST を書き換え
  let modified = false;
  traverse(ast, {
    StringLiteral(pathNode) {
      const value = pathNode.node.value;
      if (translateMap[value]) {
        pathNode.node.value = translateMap[value];
        modified = true;
      }
    },
    TemplateLiteral(pathNode) {
      pathNode.node.quasis.forEach((q) => {
        const raw = q.value.cooked ?? q.value.raw;
        if (translateMap[raw]) {
          const ja = translateMap[raw];
          q.value.raw = ja;
          q.value.cooked = ja;
          modified = true;
        }
      });
    }
  });

  if (modified) {
    const output = generator(ast, { retainLines: true }, code);
    fs.writeFileSync(filePath, output.code, "utf8");
    console.log(`=> 置換完了: ${filePath}`);
  }

  return modified;
}

// メイン処理
async function main() {
  const files = GLOBS.flatMap((pattern) => glob.sync(pattern, { nodir: true }));
  console.log("対象ファイル数:", files.length);

  let changedCount = 0;
  for (const file of files) {
    const fullPath = path.resolve(file);
    try {
      const changed = await processFile(fullPath);
      if (changed) changedCount++;
    } catch (e) {
      console.error("ファイル処理中にエラー:", fullPath, e.message);
    }
  }

  console.log("\n=== 完了 ===");
  console.log("変更多数のファイル:", changedCount);
}

main().catch((e) => {
  console.error("致命的エラー:", e);
  process.exit(1);
});

