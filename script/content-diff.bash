#!/bin/bash
set -e

function stripToContent() {
  while IFS= read -r -d '' -u 9
  do
    path=$REPLY
    sed -Ei '' \
      -e '1h;2,$H;$!d;g' \
      -e 's/^.*<div id="main-content"[^>]*>(.*)<div class="PrevNextBar.*$/\1/' \
      -e 's/id="[0-9]+(_copy_[0-9]+)?"/id="[redacted for uniqueness]"/g' \
      -e 's/(href="[^"#]+#)[0-9]+(_copy_[0-9]+)?"/\1[redacted for uniqueness]"/g' \
      -e 's/(data-cnxml-to-html-ver=")[\.0-9]+"/\1[redacted for uniqueness]"/' \
      "$path"
  done 9< <( find books -type f -exec printf '%s\0' {} + )
}

first_release="$1"
second_release="$2"

git checkout --orphan "content-diffs--$first_release-$second_release"
git clean -fd

aws s3 sync "s3://unified-web-primary/rex/releases/$first_release/books" books/
stripToContent

git add books
git commit -m "stripped content for $first_release"

rm -rf books/*

aws s3 sync "s3://unified-web-primary/rex/releases/$second_release/books" books/
stripToContent

git add books
git commit -m "stripped content for $second_release"
