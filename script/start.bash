#!/usr/bin/env bash
# spell-checker: ignore pipefail
set -euo pipefail; if [ -n "${DEBUG-}" ]; then set -x; fi

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
shared_certificate_dir=~/.openstax/certs

mkdir -p "$project_dir/data"

./script/make-certificate.bash

cd "$project_dir"

# nodejs does not use system certs by default
# - https://github.com/nodejs/node/issues/39657
export NODE_EXTRA_CA_CERTS="$shared_certificate_dir/CA.cer"
export SSL_CRT_FILE="$project_dir/data/certs/${HOST:-localhost}.cer"
export SSL_KEY_FILE="$project_dir/data/certs/${HOST:-localhost}.pvk"
export HTTPS=${HTTPS:-true}
export BROWSER=none
export DISABLE_NEW_JSX_TRANSFORM=true

# webpack 4 (via react-scripts 4) hashes with md4, which OpenSSL 3 removed, so
# node >= 17 cannot run it without re-enabling the legacy provider. Remove this
# once we are on react-scripts 5 / webpack 5 (CORE-2854).
export NODE_OPTIONS="${NODE_OPTIONS:-} --openssl-legacy-provider"

yarn craco start
