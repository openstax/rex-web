#!/usr/bin/env bash
set -e; if [ -n "$DEBUG" ]; then set -x; fi

if [ -z "$(command -v docker)" ]; then
  echo "docker is required to build swagger" > /dev/stderr;
  exit 1;
fi
if [ -z "$(command -v yarn)" ]; then
  echo "yarn is required to build swagger" > /dev/stderr;
  exit 1;
fi

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
swagger_clients=$(node -e "process.stdout.write(JSON.stringify(require('$project_dir/src/swagger-clients.js')))" | jq -c .[])

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

  echo "(swagger $client_name) fixing file permissions" > /dev/stderr;

  docker run --rm -v "$temp_dir:/shared" openapitools/openapi-generator-cli:v5.2.0 bash -c \
    'chown -R "$(stat -c "%u:%g" /shared)" /shared'

  echo "(swagger $client_name) building typescript" > /dev/stderr;

  cd "$temp_dir"

  yarn add typescript@4.2 semver
  yarn tsc --module commonjs --target es6 --lib es2015,dom --outDir dist --declaration index.ts
  
  echo "(swagger $client_name) configuring package" > /dev/stderr;

  api_version=$(docker run --rm -i stedolan/jq .info.version < swagger.json)
  npm_version=$(yarn info --silent "@openstax/$client_name" version)

  if yarn semver -r "$api_version-build.0" "$npm_version"; then
    version=$(yarn semver "$npm_version" -i prerelease)
  else
    version=""$api_version-build.0""
  fi

  cat > dist/package.json <<packagejson
{
  "name": "@openstax/$client_name",
  "description": "automatically generated swagger client",
  "version": "$version",
  "main": "index.js",
  "module": "index.es.js",
  "typings": "index.d.ts",
  "license": "MIT"
}
packagejson

  echo "(swagger $client_name) done" > /dev/stderr;

done <<< "$swagger_clients"
