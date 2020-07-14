#!/usr/bin/env bash
set -ex

git fetch origin master
git show origin/master:src/config.books.js > src/config.books.old.js

book_json=$(node -e "$(cat <<script
  const oldBooks = require('./src/config.books.old.js');
  const newBooks = require('./src/config.books.js');

  const modified = Object.keys(newBooks).map((key) => {
    if (oldBooks[key] === undefined || newBooks[key].defaultVersion !== oldBooks[key].defaultVersion) {
      return {book_id: key, book_version: newBooks[key].defaultVersion};
    }
  }).filter(record => !!record);

  console.log(JSON.stringify(modified));
script
)")

rm src/config.books.old.js

working_set=$(jq "map({(.book_id): .}) | add // {}" <<< "$book_json")

for book_id in $(jq -r "keys[]" <<< "$working_set"); do
  title=$(node script/entry.js book-info --field=title "$book_id")
  working_set=$(jq -r \
    --arg title "$title" \
    --arg book_id "$book_id" \
    '.[$book_id].title = $title' <<< "$working_set")
done


jq 'to_entries[] | .value' <<< "$working_set"
