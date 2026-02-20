#!/usr/bin/env bash
set -euo pipefail

die(){ echo "ERROR: $*" >&2; exit 1; }
log(){ echo "[+] $*"; }

# ====== 設定（必要ならここだけ触る） =========================================
ORIGIN_REMOTE="${ORIGIN_REMOTE:-origin}"
UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"

# Vercelが追っている本番ブランチ（今回 custom を差し替える）
PROD_BRANCH="${PROD_BRANCH:-custom}"

# 退避先（例: custom2 / custom2-YYYYmmdd-hhmmss）
BACKUP_BRANCH_BASE="${BACKUP_BRANCH_BASE:-custom2}"

# upstreamのどれを適用するか
# 1) TAG を指定（例: TAG=v4.9.3 ./promote_upstream_to_custom.sh）
# 2) USE_UPSTREAM_MAIN=1 で upstream/main(or master) を使う
TAG="${TAG:-}"
USE_UPSTREAM_MAIN="${USE_UPSTREAM_MAIN:-0}"

# upstream素のままにするか、旧customから「設定だけ」持ち込むか
# 0: 完全に upstream 素のまま（あなたの設定が崩れる可能性あり）
# 1: 設定のみ持ち込み（推奨：Vercel env を触らず稼働確認しやすい）
CARRY_CONFIG="${CARRY_CONFIG:-1}"

# 持ち込む「設定ファイル」一覧（最小限の推奨セット）
# 必要に応じて追加してください（例: public/favicon.ico など）
CONFIG_PATHS=(
  "blog.config.js"
  "conf"
)
# ============================================================================

# repo root に移動（lib配下での add ミス等を防止）
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || die "Not a git repository."
cd "$ROOT"

# 作業ツリーが汚れていたら止める
if ! git diff --quiet || ! git diff --cached --quiet; then
  die "Working tree has uncommitted changes. Commit or stash first."
fi

# remotes確認
git remote get-url "$ORIGIN_REMOTE" >/dev/null 2>&1 || die "remote '$ORIGIN_REMOTE' not found."
git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1 || die "remote '$UPSTREAM_REMOTE' not found."

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_BRANCH="${BACKUP_BRANCH_BASE}-${TS}"
BACKUP_BRANCH_LATEST="${BACKUP_BRANCH_BASE}"   # 最新バックアップ用（上書きしてもよい）
BACKUP_TAG="${PROD_BRANCH}-before-upstream-${TS}"

log "Fetch remotes..."
git fetch "$ORIGIN_REMOTE" --prune
git fetch "$UPSTREAM_REMOTE" --tags --prune

# origin/custom の存在確認
git show-ref --verify --quiet "refs/remotes/${ORIGIN_REMOTE}/${PROD_BRANCH}" || die "${ORIGIN_REMOTE}/${PROD_BRANCH} not found."

OLD_CUSTOM_SHA="$(git rev-parse "refs/remotes/${ORIGIN_REMOTE}/${PROD_BRANCH}")"
log "Current ${ORIGIN_REMOTE}/${PROD_BRANCH} = ${OLD_CUSTOM_SHA}"

# 退避（ローカルに枝+タグを作る→push）
log "Create local backup branches/tags..."
git branch -f "${BACKUP_BRANCH}" "${OLD_CUSTOM_SHA}"
git branch -f "${BACKUP_BRANCH_LATEST}" "${OLD_CUSTOM_SHA}"
git tag -f "${BACKUP_TAG}" "${OLD_CUSTOM_SHA}"

log "Push backup branches/tags to ${ORIGIN_REMOTE}..."
git push "${ORIGIN_REMOTE}" "${BACKUP_BRANCH}"
# custom2(最新) は存在していても安全に更新できるよう force-with-lease
git push --force-with-lease "${ORIGIN_REMOTE}" "${BACKUP_BRANCH_LATEST}:${BACKUP_BRANCH_LATEST}"
git push "${ORIGIN_REMOTE}" "${BACKUP_TAG}"

# upstream 参照点を決める
UP_REF=""
if [[ "${USE_UPSTREAM_MAIN}" == "1" ]]; then
  if git show-ref --verify --quiet "refs/remotes/${UPSTREAM_REMOTE}/main"; then
    UP_REF="${UPSTREAM_REMOTE}/main"
  elif git show-ref --verify --quiet "refs/remotes/${UPSTREAM_REMOTE}/master"; then
    UP_REF="${UPSTREAM_REMOTE}/master"
  else
    die "Neither ${UPSTREAM_REMOTE}/main nor ${UPSTREAM_REMOTE}/master exists."
  fi
else
  if [[ -z "${TAG}" ]]; then
    TAG="$(git tag -l 'v*' --sort=-v:refname | head -n 1 || true)"
    [[ -n "${TAG}" ]] || die "No v* tags found. Set TAG=vX.Y.Z or USE_UPSTREAM_MAIN=1."
  fi
  git show-ref --verify --quiet "refs/tags/${TAG}" || die "Tag not found: ${TAG}"
  UP_REF="tags/${TAG}"
fi
log "Upstream source = ${UP_REF}"

TMP_BRANCH="tmp/upstream-to-${PROD_BRANCH}-${TS}"
log "Create temp branch ${TMP_BRANCH} from ${UP_REF}"
git switch -C "${TMP_BRANCH}" "${UP_REF}"

# 設定持ち込み（推奨）
if [[ "${CARRY_CONFIG}" == "1" ]]; then
  log "Carry config from old custom commit ${OLD_CUSTOM_SHA}"
  # 指定パスが存在するものだけを checkout
  EXISTING=()
  for p in "${CONFIG_PATHS[@]}"; do
    if git cat-file -e "${OLD_CUSTOM_SHA}:${p}" 2>/dev/null; then
      EXISTING+=("${p}")
    else
      log "skip (not in old custom): ${p}"
    fi
  done

  if [[ "${#EXISTING[@]}" -gt 0 ]]; then
    git checkout "${OLD_CUSTOM_SHA}" -- "${EXISTING[@]}"
    # 変更が出たら commit（同一なら commit しない）
    if ! git diff --quiet; then
      git add -A
      git commit -m "chore(config): carry site config from previous custom"
    else
      log "No config differences to carry."
    fi
  else
    log "No config paths found in old custom. Skipping carry."
  fi
else
  log "CARRY_CONFIG=0 => pure upstream (no local config carry)."
fi

# ここで custom を置き換える（Vercel本番が切り替わる）
log "Force update ${ORIGIN_REMOTE}/${PROD_BRANCH} <= ${TMP_BRANCH}"
git fetch "${ORIGIN_REMOTE}" "${PROD_BRANCH}" >/dev/null 2>&1 || true
git push --force-with-lease "${ORIGIN_REMOTE}" "HEAD:${PROD_BRANCH}"

# ローカルも custom に合わせて固定（今後の事故防止）
log "Switch local to ${PROD_BRANCH} tracking ${ORIGIN_REMOTE}/${PROD_BRANCH}"
git fetch "${ORIGIN_REMOTE}" "${PROD_BRANCH}"
git switch -C "${PROD_BRANCH}" "${ORIGIN_REMOTE}/${PROD_BRANCH}"
git branch --set-upstream-to="${ORIGIN_REMOTE}/${PROD_BRANCH}" "${PROD_BRANCH}"

log "Done."
cat <<EOF

============================================================
OK.

Backup created (remote):
  - ${BACKUP_BRANCH_LATEST}   (latest backup pointer; overwritten each run)
  - ${BACKUP_BRANCH}          (timestamped backup)
  - tag: ${BACKUP_TAG}

Production branch replaced:
  - ${ORIGIN_REMOTE}/${PROD_BRANCH} is now based on: ${UP_REF}
  - (plus config carry = ${CARRY_CONFIG})

Now you are on local branch:
  - $(git branch --show-current)

Rollback (restore previous custom):
  git push --force-with-lease ${ORIGIN_REMOTE} ${BACKUP_BRANCH_LATEST}:${PROD_BRANCH}

============================================================
EOF
