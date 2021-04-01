#!/usr/bin/env bash

cd rex-web

if [ "$GITHUB_USERNAME" != "" ] && [ "$GITHUB_PASSWORD" != "" ]; then
  git config --global user.email "$GITHUB_USERNAME"
  git config --global user.name "$GITHUB_USERNAME"
  echo "default login $GITHUB_USERNAME password $GITHUB_PASSWORD" >> "${HOME}/.netrc"
fi

# this is here so the creds don't get pasted to the output
# set -ex

# yarn

approved_books_default_branch=$(curl -s https://api.github.com/repos/openstax/content-manager-approved-books | jq -r .default_branch)
rex_default_branch=$(curl -s https://api.github.com/repos/openstax/rex-web | jq -r .default_branch)

data=$(curl -sL "https://github.com/openstax/content-manager-approved-books/raw/$approved_books_default_branch/approved-book-list.json")
approved_books=$(echo $data | jq '.approved_books | map(select(.tutor_only == false)) | map(select(.server == "cnx.org"))')
approved_versions=$(echo $data | jq '.approved_versions')

repo_books=$(echo $approved_books | jq '[.[] | select(.repo)]')
repo_versions=$(echo $approved_versions | jq '[.[] | select(.repo)]')
collection_books=$(echo $approved_books | jq '[.[] | select(.collection_id)]')
collection_versions=$(echo $approved_versions | jq '[.[] | select(.collection_id)]')

collection_ids=$(jq -r 'map(.collection_id) | unique | .[]' <<< "$collection_books")
repos=$(jq -r 'map(.repo) | unique | .[]' <<< "$repo_books")

# git remote set-branches origin 'update-content-*'
# git remote set-branches origin --add "$rex_default_branch"

# for repo in $repos; do

# done

for collection_id in $collection_ids; do
  book_ids=$(echo $approved_books | jq --arg collection_id "$collection_id" '[.[] | select(.collection_id == $collection_id)][].books | [.[] | .uuid]')

  echo $book_ids

  for book_id in book_ids; do
    # branch="update-content-$book_id"
    # git fetch
    # git checkout "$rex_default_branch"
    # git checkout src/config.books.json
    # (git checkout "$branch" && git merge "origin/$rex_default_branch" --no-edit -X theirs) || git checkout -b "$branch"

    # there may be multiple approved versions for supporting different products, historical support, etc
    available_versions=$(jq --arg collection_id "$collection_id" 'map(select(.collection_id == $collection_id).content_version) | .[]' <<< "$collection_versions")
    echo "available_versions" $available_versions
    echo $available_versions >> temp

    # in general we want the most recent one, in the future we'll have to filter this by which ones
    # are available for the recipe code version REX supports
    desired_version=$(echo $available_versions | sort --version-sort -r | head -n 1)
    echo "desired_version sorted" $desired_version

    # approved book format has a "1." on the front of every version
    desired_version=${desired_version:2}

    echo "desired_version" $desired_version

    exit

  #   node script/entry.js update-content-versions-and-check-for-archived-slugs --bookId "$book_id" --versionNumber "$desired_version"

  #   if [[ -z $(git status --porcelain) ]]; then
  #     continue
  #   fi

  #   git add src/config.books.json
  #   git commit -m "update content" || true
  #   git push --set-upstream origin "$branch"

  #   book_title=$(node script/entry.js book-info "$book_id" --field title)
  #   curl -s -X POST -H "Authorization: token $GITHUB_ACCESS_TOKEN" "https://api.github.com/repos/openstax/rex-web/pulls" --data-binary @- << JSON
  #     {
  #       "title": "$book_title updates",
  #       "head": "$branch",
  #       "base": "$rex_default_branch"
  #     }
  # JSON
  done
done
