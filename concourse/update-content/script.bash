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

approved_books_default_branch=$(curl -s https://api.github.com/repos/openstax/content-manager-approved-books | jq -r .default_branch)
rex_default_branch=$(curl -s https://api.github.com/repos/openstax/rex-web | jq -r .default_branch)

approved_books=$(curl -sL "https://github.com/openstax/content-manager-approved-books/raw/$approved_books_default_branch/approved-books.json")
book_ids=$(jq -r '.[].uuid' <<< "$approved_books")

git remote set-branches origin 'update-content-*'
git remote set-branches origin --add "$rex_default_branch"

for book_id in $book_ids; do
  branch="update-content-$book_id"
  git fetch
  git checkout "$rex_default_branch"
  git checkout src/config.books.json
  (git checkout "$branch" && git merge "origin/$rex_default_branch" --no-edit -X theirs) || git checkout -b "$branch"

  # there may be multiple approved versions for supporting different products, historical support, etc
  approved_versions=$(jq -r --arg uuid "$book_id" '[.[]|select(.uuid==$uuid)][].version' <<< "$approved_books")

  # in general we want the most recent one, in the future we'll have to filter this by which ones
  # are available for the recipe code version REX supports
  desired_version=$(sort --version-sort -r <<< "$approved_versions" | head -n 1)

  # approved book format has a "1." on the front of every version
  desired_version=${desired_version:2}

  node script/entry.js update-content-versions-and-check-for-archived-slugs --bookId "$book_id" --newVersion "$desired_version"

  if [[ -z $(git status --porcelain) ]]; then
    continue
  fi

  git add src/config.books.json
  git commit -m "update content" || true
  git push --set-upstream origin "$branch"

  book_title=$(node script/entry.js book-info "$book_id" --field title)
  curl -s -X POST -H "Authorization: token $GITHUB_ACCESS_TOKEN" "https://api.github.com/repos/openstax/rex-web/pulls" --data-binary @- << JSON
    {
      "title": "$book_title updates",
      "head": "$branch",
      "base": "$rex_default_branch"
    }
JSON
done
