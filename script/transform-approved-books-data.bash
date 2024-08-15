#!/usr/bin/env bash

set -e

: "${1:?'First argument should be a file containing CORGI ABL array'}"
: "${2:?'Second argument should be a file containing configured books object'}"

jq --slurp --compact-output '
.[0] as $corgi_abl |
.[1] as $configured_books |
$corgi_abl |
if (type != "array") then error("Bad ABL data") else . end |
$configured_books |
if (type != "object") then error("Bad book config") else . end |
[
  # Get the newest version of each book
  $corgi_abl | group_by(.uuid) | .[] | sort_by(.commited_at) | .[-1] |

  # Store information about the entry (uuid and short sha)
  .uuid as $uuid |
  (.commit_sha | .[0:7]) as $commit_sha |

  # Select entries that do not match configured books
  select($configured_books | .[$uuid] | .defaultVersion != $commit_sha) |
  { key: .uuid, value: $commit_sha }
] | from_entries
' "$@"
