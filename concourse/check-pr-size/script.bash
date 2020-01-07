#!/usr/bin/env bash

set -e

cd rex-web-pull-request

git --no-pager diff master --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}'

diffcount=$(git --no-pager diff master --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}')

echo "$diffcount"

if [ "$diffcount" -gt "200" ]
then
  exit 1
fi
