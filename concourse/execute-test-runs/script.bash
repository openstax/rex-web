#!/bin/bash
set -e -u

BASE_DIR=$(pwd)

cd rex-web

for MILESTONE_NUMBER_PATH in "$BASE_DIR"/unified-issues-milestones/*
do
  MILESTONE_NUMBER=$(basename "$MILESTONE_NUMBER_PATH")
  ENV_NAME=release-$MILESTONE_NUMBER
  export BASE_URL=https://$ENV_NAME.sandbox.openstax.org

  echo "checking for runs using $BASE_URL"

  for TR_RUN_PATH in "$BASE_DIR"/test-plans/*
  do
    TR_RUN_ID=$(basename "$TR_RUN_PATH")
    base_url=$(< "$BASE_DIR/test-plans/$TR_RUN_ID/base_url.txt")
    
    if [[ "$BASE_URL" == "$base_url" ]]; then
      echo "found test plan $TR_RUN_ID"

      browser=$(< "$BASE_DIR/test-plans/$TR_RUN_ID/browser.txt")
      export TR_RUN_ID
      export BROWSER=$browser

      make test-rail-sauce
    fi
  done
done
