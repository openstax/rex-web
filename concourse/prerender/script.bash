#!/bin/bash

export REACT_APP_CODE_VERSION=`cat build-configs/commit.txt`
export REACT_APP_RELEASE_ID=`cat build-configs/release-id.txt`
export REACT_APP_ENV=production

DESTINATION=`pwd`/release

cd /code

yarn prerender

cp -r build/* $DESTINATION
