#!/usr/bin/env bash

set -ex

cd rex-web-pull-request

pr_sha=$(git rev-parse head)
heroku_url=$(curl -s "https://api.github.com/repos/openstax/rex-web/deployments?sha=$pr_sha" | jq -r '.[0].payload.web_url|rtrimstr("/")')

if [ -z "$heroku_url" ]; then
  echo "No deployment exists for this pr.";
  exit 1;
fi;

git show master:src/config.books.js > src/config.books.old.js

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

NEXT_WAIT_TIME=0
until [ $NEXT_WAIT_TIME -eq 5 ] || [ "$(curl -s -o /dev/null -w "%{http_code}" "$heroku_url")" == "200" ]; do
  echo "sleeping $NEXT_WAIT_TIME"
  sleep $(( NEXT_WAIT_TIME++ ))
done

if [ $NEXT_WAIT_TIME -gt 4 ]; then
  echo "timed out"
  exit 1
fi;

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
    --rootUrl "$heroku_url" \
    --queryString="validateLinks"
done
