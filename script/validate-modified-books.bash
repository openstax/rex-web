#!/usr/bin/env bash
modified_books=$(echo $(./script/get-modified-books.bash))

for row in $(jq -c '.[]' <<< "$modified_books"); do
  book_id=$(jq -r '.book_id' <<< "$row")
  book_version=$(jq -r '.book_version' <<< "$row")

  node script/domVisitor errorsExist \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --rootUrl $1 \
    --queryString="validateLinks"

  node script/entry.js urlChecker \
    --rootUrl="https://openstax.org" \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --useUnversionedUrls
done
