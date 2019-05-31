#!/bin/bash

if [ -d "./open-search" ]; then
  exit 0
fi

swagger_url=$(node -e "const {SEARCH_URL, REACT_APP_SEARCH_URL} = require('./src/config'); console.log(SEARCH_URL + REACT_APP_SEARCH_URL + '/swagger')")

tmp_file=$(mktemp -t open-search-client.XXXXX)
download_url=$(curl -H "Content-type: application/json" -s \
    -X POST \
    -d "{\"options\": {\"npmName\": \"@openstax/open-search-client\"},\"openAPIUrl\": \"$swagger_url\"}" \
    http://api.openapi-generator.tech/api/gen/clients/typescript-fetch \
    | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8'))[\"link\"])")

curl -s -o "$tmp_file" "$download_url"

unzip "$tmp_file"

mv typescript-fetch-client open-search

cd open-search || exit 1

yarn install
yarn build
