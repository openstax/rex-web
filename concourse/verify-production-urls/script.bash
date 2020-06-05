#!/bin/bash
set -ex

production_url=https://openstax.org

work_dir=$(pwd)

release_id=$(curl "${production_url}/rex/environment.json" | jq .release_id -r)
files=$(aws s3api list-objects --bucket "$PROD_UNIFIED_S3_BUCKET" --prefix "rex/releases/$release_id/books/" | jq -r '.Contents[] | .Key')

missing_files=""

for full_path in $files; do
  book_path="/release/$(grep -oP 'books.*' <<< "$full_path")"
  [ ! -f "$work_dir$book_path" ] && missing_files="$missing_files$book_path'\n'"
done

printf "$missing_files"
