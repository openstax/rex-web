#!/usr/bin/env bash
set -e; if [ -n "$DEBUG" ]; then set -x; fi

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"

if [ -d "$project_dir/src/clients" ]; then
  echo "/src/clients directory exists, skipping swagger build" > /dev/stderr;
  exit 0;
fi

if [ -z "$(which docker)" ]; then
  echo "docker is required to build swagger" > /dev/stderr;
  exit 1;
fi

swagger_clients=$(node -e "process.stdout.write(JSON.stringify(require('$project_dir/src/swagger-clients.js')))" | jq -c .[])

mkdir "$project_dir/src/clients"

while IFS= read -r swagger_client; do
  client_name=$(jq -r .name <<< "$swagger_client")
  api_host=$(jq -r .api_host <<< "$swagger_client")
  swagger_path=$(jq -r .swagger_path <<< "$swagger_client")
  secure=$(jq .secure <<< "$swagger_client")
  protocol=$(test "$secure" = "true" && echo "https" || echo "http")

  temp_dir=$(mktemp -d -t ci-XXXXXXXXXX)

  echo "(swagger $client_name) using build directory: $temp_dir" > /dev/stderr
  echo "(swagger $client_name) using swagger from $protocol://$api_host$swagger_path" > /dev/stderr

  # sometimes the swagger files don't define a host, so make sure its in there for where we got it from
  curl -s "$protocol://$api_host$swagger_path" \
    | docker run --rm -i stedolan/jq --arg host "$api_host" --arg protocol "$protocol" '. + {host: $host, schemes: [$protocol]}' \
    > "$temp_dir/swagger.json"

  echo "(swagger $client_name) building swagger" > /dev/stderr;

  docker run --rm -v "$temp_dir:/shared" openapitools/openapi-generator-cli:v5.2.0 generate \
    --additional-properties=typescriptThreePlus=true \
    -i /shared/swagger.json \
    -g typescript-fetch \
    -o /shared/src > "$temp_dir"/swagger.log.txt

  echo "(swagger $client_name) hacking the mainframe" > /dev/stderr;

  find "$temp_dir" -name '*.ts' | while IFS= read -r file; do
    cat <(echo "// @ts-nocheck") "$file" >> "$file.tmp"
    mv "$file.tmp" "$file"
  done

  rm -rf "$project_dir/src/clients/$client_name"
  mv "$temp_dir/src" "$project_dir/src/clients/$client_name"

  echo "(swagger $client_name) done" > /dev/stderr;

done <<< "$swagger_clients"
