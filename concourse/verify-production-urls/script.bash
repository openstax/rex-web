#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source build-configs/config.env
# shellcheck disable=SC2046
export $(cut -d= -f1 build-configs/config.env)

production_url=https://openstax.org
current_release_id=$(curl -s "${production_url}/rex/environment.json" | jq .release_id -r)

get_bucket_release_files () {
  aws s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$1/books/" \
  --output json | jq -r '.Contents[] | .Key' | sed -e "s/.*\/\(books\/.*\)/\1/"
}

count_files () { grep -cv '^$' <<< "$1"; }

# Bash array difference (with newline-separated inputs)
# Returns files in $1 but not in $2
# comm requires sorted inputs so we sort $1 and $2 separately first
diff_file_lists () { comm -23 <(sort <<<"$1") <(sort <<<"$2"); }

current_files=$(get_bucket_release_files "$current_release_id")
current_number=$(count_files "$current_files")

echo "testing $current_number urls from current release $current_release_id"

new_release_files=$(get_bucket_release_files "$REACT_APP_RELEASE_ID")
new_release_number=$(count_files "$new_release_files")

echo "found $new_release_number urls in new release $REACT_APP_RELEASE_ID"

missing_files=$(diff_file_lists "$current_files" "$new_release_files")

if [ -n "$missing_files" ]; then
  printf "MISSING PATHS:\n%s\n" "$missing_files"
  exit 1
else
  echo 'all current release files also present in the new release'
fi
