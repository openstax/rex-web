#!/usr/bin/env bash

set -e

data="$1"
data="${data:?}"
configured_books="$2"
configured_books="${configured_books:?}"

# shellcheck disable=SC2016
new_version_filter='[
  # Get the newest version of each book
  $corgi_abl | group_by(.uuid) | .[] | sort_by(.commited_at) | .[-1] |

  # Store information about the entry (uuid and short sha)
  .uuid as $uuid |
  (.commit_sha | .[0:7]) as $commit_sha |

  # Select entries that do not match configured books
  select($configured_books | .[$uuid] | .defaultVersion != $commit_sha) |
  { key: .uuid, value: $commit_sha }
] | from_entries'

jq \
  --null-input \
  --compact-output \
  --argjson configured_books "$configured_books" \
  --argjson corgi_abl "$data" \
  "$new_version_filter"
