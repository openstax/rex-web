#!/bin/bash
set -e -u

BASE_DIR=$(pwd)

cd rex-web

for MILESTONE_NUMBER in "$BASE_DIR"/unified-issues-milestones/*
do
  ENV_NAME=release-$MILESTONE_NUMBER
  export BASE_URL=https://$ENV_NAME.sandbox.openstax.org

  echo "checking for runs using $BASE_URL"

  for TR_RUN_ID in "$BASE_DIR"/test-plans/*
  do
    browser=$(< "$BASE_DIR/test-plans/$TR_RUN_ID/browser.txt")
    
    if [[ "$BASE_URL" == "$browser" ]]; then
      echo "found test plan $TR_RUN_ID"

      export TR_RUN_ID
      export BROWSER=$browser

      make test-rail-sauce
    fi
  done
done
