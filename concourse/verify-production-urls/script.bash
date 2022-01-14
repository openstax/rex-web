#!/usr/bin/env bash
set -euo pipefail

production_url=https://openstax.org

get_bucket_release_files () {
  if [ "$1" == "production" ]; then
    key=$PROD_AWS_ACCESS_KEY_ID
    secret=$PROD_AWS_SECRET_ACCESS_KEY
    bucket=$PROD_UNIFIED_S3_BUCKET
  else
    key=$SAND_AWS_ACCESS_KEY_ID
    secret=$SAND_AWS_SECRET_ACCESS_KEY
    bucket=$SAND_UNIFIED_S3_BUCKET
  fi

  AWS_ACCESS_KEY_ID=$key AWS_SECRET_ACCESS_KEY=$secret aws s3api list-objects \
  --bucket "$bucket" --prefix "rex/releases/$2/books/" --output json | \
  jq -r '.Contents[] | .Key' | sed -e "s/.*\/\(books\/.*\)/\1/"
}

count_files () { wc -l <<< "$1" | awk '{$1=$1};1'; }

# Bash array difference (with newline-separated inputs)
# Adapted from https://stackoverflow.com/a/28161520
# Returns files in $prod_files but not in $uploaded_files
# Algorithm:
# 1. Concatenate all entries, newline-separated
# 2. Sort entries
# 3. Remove all lines that appear more than once
# The array to be removed appears twice in the input so none of its entries are added to the output
diff_file_lists () { printf "%s\n%s\n%s\n" "$1" "$2" "$2" | sort | uniq -u; }

current_prod_release_id=$(curl -s "${production_url}/rex/environment.json" | jq .release_id -r)
current_prod_files=$(get_bucket_release_files production "$current_prod_release_id")
current_prod_number=$(count_files "$current_prod_files")

echo "testing $current_prod_number urls from current production release $current_prod_release_id"

new_release_prod_files=$(get_bucket_release_files production "$REACT_APP_RELEASE_ID")
new_release_prod_number=$(count_files "$new_release_prod_files")

echo "found $new_release_prod_number production urls in new release $REACT_APP_RELEASE_ID"

missing_prod_files=$(diff_file_lists "$current_prod_files" "$new_release_prod_files")

if [ -n "$missing_prod_files" ]; then
  printf "MISSING PRODUCTION PATHS:\n%s\n" "$missing_prod_files"
  exit 1
fi

new_release_sand_files=$(get_bucket_release_files sandbox "$REACT_APP_RELEASE_ID")
new_release_sand_number=$(count_files "$new_release_sand_files")

echo "found $new_release_sand_number sandbox urls in new release $REACT_APP_RELEASE_ID"

missing_sand_files=$(diff_file_lists "$current_prod_files" "$new_release_sand_files")

if [ -n "$missing_sand_files" ]; then
  printf "MISSING SANDBOX PATHS:\n%s\n" "$missing_sand_files"
  exit 1
fi

echo 'all current production release files also present in the new release'
