#!/usr/bin/env bash
set -ex

git fetch origin master
git show origin/master:src/config.books.json > src/config.books.old.json

book_json=$(node -e "$(cat <<script
  const oldBooks = require('./src/config.books.old.json');
  const newBooks = require('./src/config.books.json');

  const modified = Object.keys(newBooks).map((key) => {
    if (oldBooks[key] === undefined || newBooks[key].defaultVersion !== oldBooks[key].defaultVersion) {
      return {title: '', book_version: newBooks[key].defaultVersion, book_id: key};
    }
  }).filter(record => !!record);

  console.log(JSON.stringify(modified));
script
)")

rm src/config.books.old.json

working_set=$(jq "map({(.book_id): .}) | add // {}" <<< "$book_json")

for book_id in $(jq -r "keys[]" <<< "$working_set"); do
  book_version=$(jq -r --arg book_id "$book_id" '.[$book_id].book_version' <<< "$working_set")
  title=$(node script/entry.js book-info --field=title "$book_id")
  working_set=$(jq -r \
    --arg title "$title" \
    --arg book_id "$book_id" \
    '.[$book_id].title = $title' <<< "$working_set")
done

jq -cr 'to_entries | map(.value)' <<< "$working_set"
