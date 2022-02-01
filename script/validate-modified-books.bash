#!/usr/bin/env bash
set -x

modified_books=$(./script/get-modified-books.bash)
code=0

while read -r row; do
  book_id=$(jq -r '.book_id' <<< "$row")
  book_version=$(jq -r '.book_version' <<< "$row")
  is_new=$(jq -r '.is_new' <<< "$row")

  node script/entry.js domVisitor errorsExist \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --rootUrl="$BASE_URL" \
    --queryString="validateLinks" \
    || code=1

  if [ "$is_new" == false ]; then
    node script/entry.js urlChecker \
      --rootUrl="https://openstax.org" \
      --bookId="$book_id" \
      --bookVersion="$book_version" \
      --useUnversionedUrls \
      || code=1
  fi

done < <(jq -c '.[]' <<< "$modified_books")

exit $code
