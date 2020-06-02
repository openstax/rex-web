#!/usr/bin/env bash

cd rex-web

if [ "$GITHUB_USERNAME" != "" ] && [ "$GITHUB_PASSWORD" != "" ]; then
  git config --global user.email "$GITHUB_USERNAME"
  git config --global user.name "$GITHUB_USERNAME"
  echo "default login $GITHUB_USERNAME password $GITHUB_PASSWORD" >> "${HOME}/.netrc"
fi

# this is here so the creds don't get pasted to the output
set -ex

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

git remote set-branches origin 'update-content-*'
git remote set-branches origin --add master

for book_id in $book_ids; do
  branch="update-content-$book_id"
  git fetch
  git checkout master
  git checkout src/config.books.js
  (git checkout "$branch" && git merge origin/master --no-edit -X theirs) || \
    (git checkout -b "$branch" && git branch --set-upstream-to="origin/$branch")

  node script/entry update-content-versions --only "$book_id"

  git add src/config.books.js
  git commit -m "update content" || true
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
