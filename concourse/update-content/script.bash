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

approved_books=$(curl -sL https://github.com/openstax/content-manager-approved-books/raw/master/approved-books.json)
book_ids=$(jq -r '.[].uuid' <<< "$approved_books")

git remote set-branches origin 'update-content-*'
git remote set-branches origin --add master

for book_id in $book_ids; do
  branch="update-content-$book_id"
  git fetch
  git checkout master
  git checkout src/config.books.js
  (git checkout "$branch" && git merge origin/master --no-edit -X theirs) || git checkout -b "$branch"

  # extra [0] in here because at this time there is a dupe book in the config
  desired_version=$(jq -r --arg uuid "$book_id" '[.[]|select(.uuid==$uuid)][0].version' <<< "$approved_books")
  current_version=$(jq -r --arg uuid "$book_id" '.[$uuid].defaultVersion' < src/config.books.json)

  # approved book format has a "1." on the front of every version
  desired_version=${desired_version:2}

  if [ "$desired_version" == "$current_version" ]; then
    echo "$book_id alredy at desired version."
    continue
  fi

  jq \
    --arg version "$desired_version" \
    --arg uuid "$book_id" \
    '.[$uuid].defaultVersion = $version' < src/config.books.json > src/config.books.json.new

  mv src/config.books.json.new src/config.books.json

  git add src/config.books.json
  git commit -m "update content" || true
  git push --set-upstream origin "$branch"

  book_title=$(node script/entry.js book-info "$book_id" --field title)
  curl -s -X POST -H "Authorization: token $GITHUB_ACCESS_TOKEN" "https://api.github.com/repos/openstax/rex-web/pulls" --data-binary @- << JSON
    {
      "title": "$book_title updates",
      "head": "$branch",
      "base": "master"
    }
JSON
done
