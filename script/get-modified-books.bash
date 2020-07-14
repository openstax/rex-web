#!/usr/bin/env bash
set -ex

git fetch origin master
git show origin/master:src/config.books.js > src/config.books.old.js

book_ids=$(node -e "$(cat <<script
  const oldBooks = require('./src/config.books.old.js');
  const newBooks = require('./src/config.books.js');

  Object.keys(newBooks).forEach((key) => {
    if (oldBooks[key] === undefined || newBooks[key].defaultVersion !== oldBooks[key].defaultVersion) {
      console.log(key);
    }
  });
script
)")

rm src/config.books.old.js

echo "$book_ids"
