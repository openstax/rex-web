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

bucket_name=unified-web-lighthouse

# Note: this probably fails due to pagination if there are > 1,000 prefixes
last_prefix=$(aws s3api list-objects-v2 --bucket "$bucket_name" --delimiter / \
              --query 'CommonPrefixes != "null" && sort_by(CommonPrefixes, &Prefix)[-1].Prefix' --output text)

if [ "$last_prefix" != False ]; then
  aws s3 sync "s3://$bucket_name/$last_prefix" "$lighthouse_base_report_path"
fi

LIGHTHOUSE_PAGES=$(jq --compact-output --null-input '$ARGS.positional | map("https://openstax.org" + .)' \
                      --args -- "${lighthouse_paths[@]}") \
LIGHTHOUSE_BASE_REPORT_PATH="$lighthouse_base_report_path" \
REACT_APP_ENV=test \
SERVER_MODE=built \
yarn jest --config "$project_dir/jest-puppeteer.config.json" "$project_dir/src/lighthouse.prerenderspec.ts"

current_date=$(date '+%Y-%m-%d')
aws s3 sync "$lighthouse_base_report_path" "s3://$bucket_name/$current_date"
