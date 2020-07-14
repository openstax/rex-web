#!/usr/bin/env bash
set -ex

git fetch origin master
git show origin/master:src/config.books.js > src/config.books.old.js

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

failed=0

for book_id in $book_ids; do
  book_version=$(node -e "$(cat <<script
    const newBooks = require('./src/config.books.js');
    console.log(newBooks['$book_id'].defaultVersion);
script
  )")

  echo "ensuring production urls exist for: $book_id@$book_version"

  # scans production and raises any new urls
  node script/entry.js urlChecker errorsExist \
    --rootUrl="https://openstax.org" \
    --bookId="$book_id" \
    --bookVersion="$book_version"  \
    --useUnversionedUrls || failed=1
done

review_url=$(./script/get-review-environment.bash)

for book_id in $book_ids; do
  book_version=$(node -e "$(cat <<script
    const newBooks = require('./src/config.books.js');
    console.log(newBooks['$book_id'].defaultVersion);
script
  )")

  echo "scanning review environment for: $book_id@$book_version"

  # scans the heroku environment for errors
  node script/entry.js domVisitor errorsExist \
    --bookId="$book_id" \
    --bookVersion="$book_version"  \
    --rootUrl "$review_url" \
    --queryString="validateLinks" || failed=1
done

exit "$failed"
