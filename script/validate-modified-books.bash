#!/usr/bin/env bash
modified_books=$(./script/get-modified-books.bash)

for row in $(jq -c '.[]' <<< "$modified_books"); do
  book_id=$(jq -r '.book_id' <<< "$row")
  book_version=$(jq -r '.book_version' <<< "$row")

  node script/domVisitor errorsExist \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --rootUrl="$BASE_URL" \
    --queryString="validateLinks"
  if [ $? != 0 ]; then                   
    echo "Error $? in domVisitor script for book $book_id" && exit 1
  fi

  node script/entry.js urlChecker \
    --rootUrl="https://openstax.org" \
    --bookId="$book_id" \
    --bookVersion="$book_version" \
    --useUnversionedUrls
  if [ $? != 0 ]; then                   
   echo "Error $? in urlChecker script for book $book_id" && exit 1
  fi
done
