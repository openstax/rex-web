#!/bin/bash
set -ex

bucket=sandbox-unified-web-primary
production_url=https://openstax.org

work_dir=$(pwd)

release_id=$(curl "${production_url}/rex/release.json" | jq .id -r)
files=$(aws s3api list-objects --bucket "$bucket" --prefix "rex/releases/$release_id/books/" | jq -r '.Contents[] | .Key')

while IFS= read -r full_path; do
  book_path=$(grep -oP '/books.*' <<< "$full_path")
  [ ! -f "$work_dir$book_path" ] && exit 1
done <<< "$files"
