#!/usr/bin/env bash
set -ex
# loads every page on heroku for any books that have new
# versions in the code and ensure that the app is not displaying
# an error screen (errors registered in redux)

book_ids=$(./script/get-modified-books.bash)

if [ -z "$book_ids" ]; then
  echo "No modified books found.";
  exit 0;
fi;

failed=0

if [ -z "$BASE_URL" ]
then
  BASE_URL=$(./script/get-review-environment.bash)
fi

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
    --rootUrl "$BASE_URL" \
    --queryString="validateLinks" || failed=1
done

exit "$failed"
