#!/bin/bash -eux

set -o pipefail

# shellcheck disable=SC1091
source build-configs/config.env
# shellcheck disable=SC2046
export $(cut -d= -f1 build-configs/config.env)

cd rex-web

yarn install
yarn build:clean
yarn prerender:work
