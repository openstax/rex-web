#!/usr/bin/env bash
set -x

modified_books=$(./script/get-modified-books.bash)
code=0

for row in $(jq -c '.[]' <<< "$modified_books"); do
  book_id=$(jq -r '.book_id' <<< "$row")
  book_version=$(jq -r '.book_version' <<< "$row")

  node script/entry.js domVisitor errorsExist \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --rootUrl="$BASE_URL" \
    --queryString="validateLinks" \
    || code=1

  node script/entry.js urlChecker \
    --rootUrl="https://openstax.org" \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --useUnversionedUrls \
    || code=1

done

exit $code
