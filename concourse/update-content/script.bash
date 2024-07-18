#!/usr/bin/env bash

cd /code

if [ "$GITHUB_USERNAME" != "" ] && [ "$GITHUB_PASSWORD" != "" ]; then
  git config --global user.email "$GITHUB_USERNAME"
  git config --global user.name "$GITHUB_USERNAME"
  echo "default login $GITHUB_USERNAME password $GITHUB_PASSWORD" >> "${HOME}/.netrc"
fi

# this is here so the creds don't get pasted to the output
set -e; if [ -n "$DEBUG" ]; then set -x; fi

rex_default_branch=$(curl -s https://api.github.com/repos/openstax/rex-web | jq -r .default_branch)

# consumer: Limit entries to those where consumer == <consumer>
# code_version: Limit entries to those where code_version <= <code_version>
archive_version="$(jq -r '.REACT_APP_ARCHIVE' "src/config.archive-url.json")"
search="consumer=REX&code_version=$archive_version"
abl_url="https://corgi.ce.openstax.org/api/abl/?$search"

book_ids_and_versions="$(
  bash script/transform-approved-books-data.bash \
    <(curl -sL --fail --show-error "$abl_url") \
    "src/config.books.json"
)"
book_entries=$(echo "$book_ids_and_versions" | jq -c 'to_entries | .[]')

git remote set-branches origin 'update-content-*'
git remote set-branches origin --add "$rex_default_branch"

errors=()

for book_and_version in $book_entries; do
  book_id=$(echo "$book_and_version" | jq -r '.key')
  new_version=$(echo "$book_and_version" | jq -r '.value')

  function report_error() {
    errors+=("$book_id"@"$new_version")
  }

  set +e; trap "report_error; continue" ERR

  branch="update-content-$book_id"
  git fetch
  git checkout "$rex_default_branch"
  git checkout src/config.books.json
  (git checkout "$branch" && git merge "origin/$rex_default_branch" --no-edit -X theirs) || git checkout -b "$branch"

  current_version=$(jq -r --arg bookId "$book_id" '.[$bookId].defaultVersion' < src/config.books.json)

  if [[ "$current_version" == "$new_version" ]]; then
    continue
  fi

  node script/entry.js update-archive-version --contentVersion "$book_id@$new_version"

  if [[ -z $(git status --porcelain) ]]; then
    continue
  fi

  git add src/config.books.json
  git add data/
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

set -e; trap - ERR

if [[ "${#errors[@]}" != 0 ]]; then
  for book_id_and_version in "${errors[@]}"
  do
    echo "Book with ID@VERSION: $book_id_and_version couldn't be updated"
  done
  exit 1
fi
