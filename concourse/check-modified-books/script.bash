#!/usr/bin/env bash

set -ex

cd rex-web-pull-request

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

function github {
  curl -s -H "Authentication: token $GITHUB_ACCESS_TOKEN" "https://api.github.com/$1"
}

pr_sha=$(git rev-parse HEAD)

NEXT_WAIT_TIME=0
until [ $NEXT_WAIT_TIME -eq 10 ] || [ "$(github "repos/openstax/rex-web/deployments?sha=$pr_sha" | jq -r '.[0].task')" == "deploy" ]; do
  echo "sleeping $NEXT_WAIT_TIME"
  sleep $(( NEXT_WAIT_TIME++ ))
done

pr_deployment_id=$(github "repos/openstax/rex-web/deployments?sha=$pr_sha" | jq -r '.[0].id')

if [ -z "$pr_deployment_id" ]; then
  echo "No deployment exists for this pr.";
  exit 1;
fi;

NEXT_WAIT_TIME=0
until [ $NEXT_WAIT_TIME -eq 40 ] || [ "$(github "repos/openstax/rex-web/deployments/$pr_deployment_id/statuses" | jq -r .[0].state)" == "success" ]; do
  echo "sleeping $NEXT_WAIT_TIME"
  sleep $(( NEXT_WAIT_TIME++ ))
done

if [ $NEXT_WAIT_TIME -gt 39 ]; then
  echo "timed out"
  exit 1
fi;

heroku_url=$(github "repos/openstax/rex-web/deployments/$pr_deployment_id" | jq -r '.payload.web_url|rtrimstr("/")')

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
