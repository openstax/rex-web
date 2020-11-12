#!/usr/bin/env bash
set -e

production_url=https://openstax.org

work_dir=$(pwd)
failed=0

release_id=$(curl -s "${production_url}/rex/environment.json" | jq .release_id -r)
files=$(aws --profile openstax s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$release_id/books/" | jq -r '.Contents[] | .Key')
number=$(wc -l <<< "$files" | awk '{$1=$1};1')

echo "testing $number urls..."

for full_path in $files; do
  file_path="/release/$(sed -e "s/.*\/\(books\/.*\)/\1/" <<< "$full_path")"
  if [ ! -f "$work_dir$file_path" ]; then
    echo "MISSING PATH: $file_path";
    failed=1;
  fi;
done

exit "$failed"
