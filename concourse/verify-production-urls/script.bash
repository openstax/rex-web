set -ex

bucket=sandbox-unified-web-primary
production_url=https://openstax.org

release_id=$(curl "${production_url}/rex/release.json" | jq .id -r)

files=$(aws s3api list-objects --bucket "$bucket" --prefix "rex/releases/$release_id/books/" | jq -r '.Contents[] | .Key')

while IFS= read -r line; do
  $line
done <<< "$files"
