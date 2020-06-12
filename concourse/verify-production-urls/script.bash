#!/bin/bash
set -ex

production_url=https://openstax.org

work_dir=$(pwd)
failed=0
PROD_UNIFIED_S3_BUCKET=sandbox-unified-web-primary
release_id=$(curl "${production_url}/rex/environment.json" | jq .release_id -r)
files=$(aws s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$release_id/books/" | jq -r '.Contents[] | .Key')

for full_path in $files; do
  file_path="/release/$(sed -e "s/.*\/\(books\/.*\)/\1/" <<< "$full_path")"
  if [ ! -f "$work_dir$file_path" ]; then
    echo "$file_path";
    failed=1;
  fi;
done

exit "$failed"
