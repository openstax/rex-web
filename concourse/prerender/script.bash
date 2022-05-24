#!/bin/bash

set -euxo pipefail

destination=$(pwd)/release

# shellcheck disable=SC1091
source build-configs/config.env
# shellcheck disable=SC2046
export $(cut -d= -f1 build-configs/config.env)

cd /code

yarn "prerender:$PRERENDER_MODE"

cp -r build/* "$destination"
