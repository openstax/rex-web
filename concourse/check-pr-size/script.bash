#!/usr/bin/env bash

set -exv

cd rex-web-pull-request

sha=$(<.git/resource/head_sha)

echo "$sha"

git checkout "$sha"

ls

git status

git --no-pager diff origin/master

git --no-pager diff origin/master --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}'

diffcount=$(git --no-pager diff origin/master --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}')

echo "$diffcount"

if [ "$diffcount" -gt "200" ]
then
  exit 1
fi
