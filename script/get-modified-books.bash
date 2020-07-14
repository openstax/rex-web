#!/usr/bin/env bash
set -ex

git fetch origin master
git show origin/master:src/config.books.js > src/config.books.old.js

book_json=$(node -e "$(cat <<script
  const oldBooks = require('./src/config.books.old.js');
  const newBooks = require('./src/config.books.js');

  const modified = Object.keys(newBooks).map((key) => {
    if (oldBooks[key] === undefined || newBooks[key].defaultVersion !== oldBooks[key].defaultVersion) {
      return {book: key, version: newBooks[key].defaultVersion};
    }
  }).filter(record => !!record);

  console.log(JSON.stringify(modified));
script
)")

rm src/config.books.old.js

echo "$book_json"
