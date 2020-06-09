#!/usr/bin/env bash

set -ex

cd rex-web-pull-request

PATH="$PATH:$(pwd)/concourse/common"

yarn

git remote add origin "https://${GITHUB_ACCESS_TOKEN}@github.com/openstax/rex-web.git"
git fetch origin master

git rev-parse origin/master
git rev-parse master
git rev-parse head

git show origin/master:src/config.books.js > src/config.books.old.js

grep College < src/config.books.old.js
grep College < src/config.books.old.js

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

if [ -z "$book_ids" ]; then
  echo "No modified books found.";
  exit 0;
fi;

review_url=$(get_review_environment)

for book_id in $book_ids; do

  book_version=$(node -e "$(cat <<script
    const newBooks = require('./src/config.books.js');
    console.log(newBooks['$book_id'].defaultVersion);
script
  )")

  echo "$book_id@$book_version"

  node script/entry.js domVisitor errorsExist \
    --bookId="$book_id" \
    --bookVersion="$book_version"  \
    --rootUrl "$review_url" \
    --queryString="validateLinks"
done
