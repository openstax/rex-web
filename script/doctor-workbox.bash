#!/bin/bash
# shellcheck disable=SC2016
# sed expression needs $s
set -e

function abs_path {
  (cd "$(dirname '$1')" &>/dev/null && printf "%s/%s" "$PWD" "${1##*/}")
}

build=$(abs_path "${BASH_SOURCE%/*}/../build")
worker="$build"/service-worker.js
workerMap="$build"/service-worker.js.map

mkdir "$build"/books

mv "$worker" "$build"/books/
mv "$workerMap" "$build"/books/
