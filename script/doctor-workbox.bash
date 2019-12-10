#!/bin/bash
# shellcheck disable=SC2016
# sed expression needs $s
set -e

echo "HACKING WORKBOX SCRIPT WITH STRING REPLACEMENT"
echo "remove this when offical solution is merged https://github.com/facebook/create-react-app/pull/5369"

worker="${BASH_SOURCE%/*}/../build/service-worker.js"

echo "$worker"

echo "ls"
ls


echo "build"
ls build

sed -Ei '' \
  -e '1h;2,$H;$!d;g' \
  -e "s/\"\/index\.html.*}\);//" \
  "$worker"

echo -n "\"/index.html\"), {
  blacklist: [/^\/accounts/,/^\/_/,/\/[^\/]+\.[^\/]+$/],
});" >> "$worker"
