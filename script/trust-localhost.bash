#!/usr/bin/env bash
# spell-checker: ignore pipefail Keychains keychain
set -euo pipefail; if [ -n "${DEBUG-}" ]; then set -x; fi

shared_certificate_dir=~/.openstax/certs

sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$shared_certificate_dir"/CA.cer
