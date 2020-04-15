#!/bin/bash
# shellcheck disable=SC2016
# sed expression needs $s
set -e

echo "HACKING WORKBOX SCRIPT WITH STRING REPLACEMENT"
echo "remove this when offical solution is merged https://github.com/facebook/create-react-app/pull/5369"

function abs_path {
  (cd "$(dirname '$1')" &>/dev/null && printf "%s/%s" "$PWD" "${1##*/}")
}

worker=$(abs_path "${BASH_SOURCE%/*}/../build")/service-worker.js

# remove default registerNavigationRoute
cp "$worker" "$worker".bak
head -n 35 "$worker".bak > "$worker"

cat >> "$worker" <<- EOM
workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("/index.html"), {
  blacklist: [/^\/accounts/,/^\/_/,/\/[^/]+\.[^/]+$/],
});

workbox.routing.registerRoute(
  /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/mathjax\//,
  new workbox.strategies.CacheFirst()
);
workbox.routing.registerRoute(
  /\/cms\/assets\//,
  new workbox.strategies.StaleWhileRevalidate()
);
workbox.routing.registerRoute(
  /\/contents\//,
  new workbox.strategies.CacheFirst()
);
workbox.routing.registerRoute(
  /\/apps\/cms\/api\//,
  new workbox.strategies.StaleWhileRevalidate()
);
EOM
