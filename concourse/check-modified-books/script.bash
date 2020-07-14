#!/usr/bin/env bash

cd rex-web-pull-request || exit 1
git remote add origin "https://${GITHUB_ACCESS_TOKEN}@github.com/openstax/rex-web.git"
yarn

./script/scan-modified-books.bash
