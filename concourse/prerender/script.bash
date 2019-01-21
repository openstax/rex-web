#!/bin/bash

export CODE_VERSION=`cat build-configs/commit.txt`
export RELEASE_ID=`cat build-configs/release-id.txt`
export NODE_ENV=production

DESTINATION=`pwd`/release

cd /code

yarn prerender

cp -r build/* $DESTINATION
