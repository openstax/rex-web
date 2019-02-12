#!/bin/bash

yarn test || exit 111

# Lint all `.sh` and `.bash` files (but not ones in `node_modules`)
if [[ $(command -v shellcheck) ]]; then
  # shellcheck disable=SC2046
  shellcheck $(find . -type f \( -iname '*\.sh' -or -iname '*\.bash' \) | grep -v 'node_modules' ) >&2 || exit 111
fi