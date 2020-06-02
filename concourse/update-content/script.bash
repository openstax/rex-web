#!/usr/bin/env bash
set -ex

cd rex-web

yarn

export ARCHIVE_URL="https://archive.cnx.org"

node script/entry update-content-versions

mv src/config.books.js src/config.books.new.js
git checkout src/config.books.js

book_ids=$(node -e "$(cat <<script
  const oldBooks = require('./src/config.books.js');
  const newBooks = require('./src/config.books.new.js');
  Object.keys(newBooks).forEach((key) => {
    if (newBooks[key].defaultVersion !== oldBooks[key].defaultVersion) {
      console.log(key);
    }
  });
script
)")

rm src/config.books.new.js

git fetch

for book_id in $book_ids; do
  branch="update-content-$book_id"
  git checkout master
  git checkout src/config.books.js
  git checkout "$branch" || git checkout -b "$branch"
  git pull || true

  node script/entry update-content-versions --only "$book_id"

  git add src/config.books.js
  git commit -c commit.gpgsign=false -m "update content" || true
  git push

  book_title=$(node script/entry.js book-info "$book_id" --field title)

  curl -s -X POST -H "Authorization: token $GITHUB_ACCESS_TOKEN" "https://api.github.com/repos/openstax/rex-web/pulls" --data-binary @- << JSON
    {
      "title": "$book_title updates",
      "head": "$branch",
      "base": "master",
      "draft": true
    }
JSON

done
