#!/usr/bin/env bash
set -euo pipefail

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"

lighthouse_paths=(
  /books/anatomy-and-physiology/pages/1-introduction
  /books/biology-2e/pages/1-introduction
  /books/introduction-sociology-3e/pages/1-introduction
  /books/psychology-2e/pages/1-introduction
  /books/us-history/pages/1-introduction
)

lighthouse_base_report_path=/tmp/lighthouse-reports

mkdir -p "$lighthouse_base_report_path"

LIGHTHOUSE_PAGES=$(jq --compact-output --null-input '$ARGS.positional | map("https://openstax.org" + .)' \
                      --args -- "${lighthouse_paths[@]}") \
LIGHTHOUSE_BASE_REPORT_PATH="$lighthouse_base_report_path" \
REACT_APP_ENV=test \
SERVER_MODE=built \
yarn jest --config "$project_dir/jest-puppeteer.config.json" "$project_dir/src/lighthouse.prerenderspec.ts"
