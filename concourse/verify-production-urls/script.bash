#!/usr/bin/env bash
set -euo pipefail

production_url=https://openstax.org
current_release_id=$(curl -s "${production_url}/rex/environment.json" | jq .release_id -r)

get_bucket_release_files () {
  AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  aws s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$1/books/" \
  --output json | jq -r '.Contents[] | .Key' | sed -e "s/.*\/\(books\/.*\)/\1/"
}

count_files () { wc -l <<< "$1" | awk '{$1=$1};1'; }

# Bash array difference (with newline-separated inputs)
# Adapted from https://stackoverflow.com/a/28161520
# Returns files in $1 but not in $2
# Algorithm:
# 1. Concatenate all entries, one on each line
# 2. Sort lines
# 3. Remove all lines that appear more than once
# The array to be removed appears twice in the input so none of its entries are added to the output
diff_file_lists () { printf "%s\n%s\n%s\n" "$1" "$2" "$2" | sort | uniq -u; }

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
fi

echo 'all current release files also present in the new release'
