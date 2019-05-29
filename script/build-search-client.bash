#!/bin/bash

if [ -d "./open-search" ]; then
  exit 0
fi

tmp_file=$(mktemp -t open-search-client)
download_url=$(curl -H "Content-type: application/json" -s \
    -X POST \
    -d '{"options": {"npmName": "@openstax/open-search-client"},"openAPIUrl": "http://petstore.swagger.io/v2/swagger.json"}' \
    http://api.openapi-generator.tech/api/gen/clients/typescript-fetch \
    | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8'))[\"link\"])")

curl -s -o "$tmp_file" "$download_url"

unzip "$tmp_file"

mv typescript-fetch-client open-search

cd open-search || exit 1

yarn install
yarn build
