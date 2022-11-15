#!/usr/bin/env bash
# spell-checker: ignore pipefail
set -euo pipefail; if [ -n "${DEBUG-}" ]; then set -x; fi

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
shared_certificate_dir=~/.openstax/certs

mkdir -p "$project_dir/data"

./script/make-certificate.bash

cd "$project_dir"

export NODE_EXTRA_CA_CERTS="$shared_certificate_dir/CA.cer"
export SSL_CRT_FILE="$project_dir/data/certs/${HOST:-localhost}.cer"
export SSL_KEY_FILE="$project_dir/data/certs/${HOST:-localhost}.pvk"
export HTTPS=${HTTPS:-true}
export BROWSER=none
export DISABLE_NEW_JSX_TRANSFORM=true

yarn craco start
