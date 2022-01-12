#!/usr/bin/env bash
set -e

production_url=https://openstax.org

work_dir=$(pwd)
failed=0

prod_release_id=$(curl -s "${production_url}/rex/environment.json" | jq .release_id -r)
prod_files=$(aws --profile openstax s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$prod_release_id/books/" | jq -r '.Contents[] | .Key' | sed -e "s/.*\/\(books\/.*\)/\1/")
prod_number=$(wc -l <<< "$prod_files" | awk '{$1=$1};1')

uploaded_files=$(aws --profile openstax s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$REACT_APP_RELEASE_ID/books/" | jq -r '.Contents[] | .Key' | sed -e "s/.*\/\(books\/.*\)/\1/")
uploaded_number=$(wc -l <<< "$uploaded_files" | awk '{$1=$1};1')

# Bash array difference (with newline-separated inputs)
# Adapted from https://stackoverflow.com/a/28161520
# Returns files in $prod_files but not in $uploaded_files
# Algorithm:
# 1. Concatenate all entries, newline-separated
# 2. Sort entries
# 3. Remove all lines that appear more than once
# The array to be removed appears twice in the input so none of its entries are added to the output
not_uploaded_files=$(print "$prod_files\n$uploaded_files\n$uploaded_files" | sort | uniq -u)
not_uploaded_number=$(wc -l <<< "$not_uploaded_files" | awk '{$1=$1};1')

echo "Production: $prod_number urls. Already uploaded: $uploaded_number urls. Testing: $not_uploaded_number urls."

for path_starting_with_book in $not_uploaded_files; do
  file_path="/release/$path_starting_with_book"

  if [ ! -f "$work_dir$file_path" ]; then
    echo "MISSING PATH: $file_path";
    failed=1;
  fi;
done

exit "$failed"
