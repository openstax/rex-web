#!/bin/bash
# shellcheck disable=SC2016
# sed expression needs $s
set -e

echo "HACKING WORKBOX SCRIPT WITH STRING REPLACEMENT"
echo "remove this when offical solution is merged https://github.com/facebook/create-react-app/pull/5369"

sed -Ei '' \
  -e '1h;2,$H;$!d;g' \
  -e "s/\"\/index\.html.*}\);//" \
  "build/service-worker.js"

echo -n "\"/index.html\"), {
  blacklist: [/^\/accounts/,/^\/_/,/\/[^\/]+\.[^\/]+$/],
});" >> "build/service-worker.js"
