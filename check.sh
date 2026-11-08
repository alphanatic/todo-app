#!/usr/bin/env bash
# critonite-git-repo-check: check a repo before a commit. Privacy, files that must never be committed, and the
# project's own check. The same file in every project; project settings live in check.conf beside it.
# Prints "file:line  reason" for each problem and exits non-zero if there is any.
# Usage: check.sh [--build]    (--build runs BUILD_CMD instead of CHECK_CMD)
set -euo pipefail

root=$(cd "$(dirname "$0")" && pwd)
cd "$root"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail() { echo "  $1"; echo x >> "$tmp/problems"; }   # counted in a file: report runs in a pipe

# Prints each "file:line:match" from grep as a failure with a reason
report() { local why=$1; while IFS= read -r hit; do fail "$hit  $why"; done; }

SITE_DIR=""; CHECK_CMD=""; BUILD_CMD=""; BLOCKLIST_NAME=""
[ -f check.conf ] && . ./check.conf

# Text files that are committed or staged
mapfile -t scan < <(git ls-files -- '*.html' '*.js' '*.mjs' '*.ts' '*.astro' '*.md' '*.css' '*.sh' '*.json' \
  '*.tf' '*.yml' '*.yaml' '*.toml' '*.py' '*.txt' '*.conf' | grep -v 'package-lock\.json$' || true)
[ ${#scan[@]} -gt 0 ] || scan=(/dev/null)

echo "1. Access"
grep -nHoE 'BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}' "${scan[@]}" | report "secret (key or token)" || true

echo "2. Location"
grep -nHoP '(?<![0-9.])([0-9]{1,3}\.){3}[0-9]{1,3}(?!\.?[0-9])' "${scan[@]}" \
  | grep -vE ':(0\.0\.0\.0|10\.[0-9.]+|127\.[0-9.]+|192\.168\.[0-9.]+|172\.(1[6-9]|2[0-9]|3[01])\.[0-9.]+)$' \
  | report "public IP" || true
grep -nHoE '(^|[^0-9a-fA-F-])[0-9]{12}([^0-9a-fA-F-]|$)' "${scan[@]}" | sed -E 's/:[^0-9]?([0-9]{12})[^0-9]?$/:\1/' \
  | report "12-digit number: account ID?" || true
grep -nHoE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "${scan[@]}" \
  | grep -vE ':(git@github\.com|noreply@anthropic\.com)$' | report "email address" || true

echo "3. Admin accounts"
grep -nHoiE '\badm(in)?[-_.](&lt;|<)?[a-z0-9]+(&gt;|>)?|\b[a-z0-9]+[-_]admin\b' "${scan[@]}" \
  | grep -vE ':adm-(kiwi|&lt;alias&gt;|<alias>)$' | report "admin account in a committed file" || true

echo "4. Private block list"
blocklist="${XDG_CONFIG_HOME:-$HOME/.config}/${BLOCKLIST_NAME:-none}/blocklist"
if [ -n "$BLOCKLIST_NAME" ] && [ -s "$blocklist" ]; then
  grep -nHoiwFf <(grep -v '^\s*\(#\|$\)' "$blocklist") "${scan[@]}" | sort -u | report "word from the private block list" || true
else
  if [ -n "$BLOCKLIST_NAME" ]; then echo "  skipped (no $blocklist)"; else echo "  skipped (no BLOCKLIST_NAME in check.conf)"; fi
fi

echo "5. Never committed"
# .default/ is the project's always-private folder; Terraform state and plans hold account and resource IDs;
# env and key files hold secrets
git ls-files | grep -E '^\.default/|(^|/)(terraform\.tfstate[^/]*|tfplan|\.terraform/.*|\.env(\..*)?|[^/]*\.pem|id_[a-z0-9]+)$' \
  | sed 's/$/:1/' | report "must never be committed: untrack it (git rm --cached)" || true

echo "6. Project"
cmd=$CHECK_CMD; var=CHECK_CMD
[ "${1:-}" = "--build" ] && { cmd=$BUILD_CMD; var=BUILD_CMD; }
dir=${SITE_DIR:-.}
if [ -z "$cmd" ]; then
  echo "  skipped (no $var in check.conf)"
elif [ -f "$dir/package.json" ] && [ ! -d "$dir/node_modules" ]; then
  echo "  skipped (no $dir/node_modules: run npm ci in $dir/)"
else
  (cd "$dir" && eval "$cmd") >"$tmp/project.log" 2>&1 && echo "  $cmd passed" \
    || { tail -20 "$tmp/project.log" | sed 's/^/  /'; fail "project: $cmd failed"; }
fi

problems=0; [ -f "$tmp/problems" ] && problems=$(wc -l < "$tmp/problems")
echo
if [ "$problems" -eq 0 ]; then echo "✓ all checks passed"; else echo "✗ $problems problem(s)"; exit 1; fi
