#!/usr/bin/env bash

set -e

cd rex-web-pull-request

diffcount=$(git diff master --numstat ':(exclude)*.snap' ':(exclude)yarn.lock' | cut -f1,2 | awk '{s+=$1+$2}END{print s}')
if [ "$diffcount" -gt "200" ]
then
  exit 1
fi
