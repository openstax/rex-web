#!/usr/bin/env bash

set -exv

cd rex-web-pull-request

base_sha=$(<.git/resource/base_sha)
head_sha=$(<.git/resource/head_sha)

echo "$head_sha"

git rev-parse HEAD

git checkout "$head_sha"

ls

git status

git --no-pager diff "$base_sha"

git --no-pager diff "$base_sha" --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}'

diffcount=$(git --no-pager diff "$base_sha" --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}')

echo "$diffcount"

if [ "$diffcount" -gt "200" ]
then
  exit 1
fi
