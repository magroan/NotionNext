#!/usr/bin/env bash
# apply_safe_jaJP_patch.sh
#
# 目的:
#   /ja-JP の prerender 時に発生している
#   "RangeError: Invalid time value" を疑われる部分だけ、
#   オリジナル NotionNext の実装に戻す。
#
# 対象ファイル:
#   - lib/rss.js
#   - lib/db/getSiteData.js
#
# 仕様:
#   - Ubuntu / bash 用
#   - 現在のリポジトリは変更されたまま
#   - 上記 2 ファイルのみオリジナルから上書き
#   - 上書き前のファイルは *.bak_safe_jaJP としてバックアップ

set -Eeuo pipefail

ORIGIN_ZIP_URL="https://codeload.github.com/tangly1024/NotionNext/zip/refs/heads/main"

# 一時ディレクトリ作成
TMP_DIR="$(mktemp -d)"
ORIG_DIR="$TMP_DIR/NotionNext-main"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo ">>> [1/4] オリジナル NotionNext をダウンロード中..."
curl -L "$ORIGIN_ZIP_URL" -o "$TMP_DIR/original.zip"

echo ">>> [2/4] ZIP を展開中..."
unzip -q "$TMP_DIR/original.zip" -d "$TMP_DIR"

# ディレクトリ名の自動検出 (NotionNext-main でない場合にも対応)
if [ ! -d "$ORIG_DIR" ]; then
  DETECTED_DIR="$(find "$TMP_DIR" -maxdepth 1 -type d -name 'NotionNext-*' | head -n 1 || true)"
  if [ -z "$DETECTED_DIR" ]; then
    echo "✗ オリジナル NotionNext ディレクトリを検出できませんでした。" >&2
    exit 1
  fi
  ORIG_DIR="$DETECTED_DIR"
fi

# 実行ディレクトリチェック
if [ ! -f "package.json" ] || [ ! -d "lib" ]; then
  echo "✗ このスクリプトは fork した NotionNext リポジトリのルートで実行してください。" >&2
  echo "  例: cd /path/to/your/NotionNext && bash apply_safe_jaJP_patch.sh" >&2
  exit 1
fi

backup_file() {
  local path="$1"
  if [ -f "$path" ] && [ ! -f "${path}.bak_safe_jaJP" ]; then
    cp "$path" "${path}.bak_safe_jaJP"
    echo "    backup: ${path} -> ${path}.bak_safe_jaJP"
  fi
}

restore_from_original() {
  local rel="$1"
  local src="${ORIG_DIR}/${rel}"
  local dst="${rel}"

  echo ">>> 処理中: ${rel}"

  if [ ! -f "$src" ]; then
    echo "    ⚠ オリジナル側に ${rel} が見つかりません。スキップします。" >&2
    return 0
  fi

  # バックアップ
  if [ -f "$dst" ]; then
    backup_file "$dst"
  else
    mkdir -p "$(dirname "$dst")"
  fi

  # コピー
  cp "$src" "$dst"
  echo "    restored from original: ${rel}"
}

echo ">>> [3/4] 対象ファイルをオリジナルから復元します..."

RESTORE_FILES=(
  "lib/rss.js"
  "lib/db/getSiteData.js"
)

for f in "${RESTORE_FILES[@]}"; do
  restore_from_original "$f"
done

echo ">>> [4/4] 完了しました。"
echo "    - 上記ファイルは tangly1024/NotionNext(main) の内容に戻しました。"
echo "    - 変更前のファイルは *.bak_safe_jaJP として同じ場所に保存されています。"
echo
echo "次のステップ:"
echo "  1) git diff で変更内容を確認することをおすすめします。"
echo "       git diff lib/rss.js lib/db/getSiteData.js"
echo "  2) Vercel で再デプロイして、/ja-JP の prerender エラーが解消したか確認してください。"

