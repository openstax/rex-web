#!/usr/bin/env bash

set -ex

cd rex-web-pull-request

base_sha=$(<.git/resource/base_sha)

diffcount=$(git --no-pager diff "$base_sha" --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}')

if [ "$diffcount" -gt "200" ]
then
  exit 1
fi
