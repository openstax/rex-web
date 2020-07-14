#!/usr/bin/env bash
set -ex
# fetches new book data for versions changed in the repo and ensures that
# all pages already exist on production. this will give a false negative
# for new pages, but correctly fail for renamed pages. per content team,
# removing pages is not a thing that generally happens.
#
# there is a different check that happens in release verification that
# works in the other direction (check that production urls are handled
# in the release) which is higher fidelity, but this is a good pre-check.

book_ids=$(./script/get-modified-books.bash)

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

  node script/entry.js urlChecker errorsExist \
    --rootUrl="https://openstax.org" \
    --bookId="$book_id" \
    --bookVersion="$book_version"  \
    --useUnversionedUrls || failed=1
done

exit "$failed"
