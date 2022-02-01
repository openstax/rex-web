#!/usr/bin/env bash
set -ex

aws s3api get-object --bucket "$PROD_UNIFIED_S3_BUCKET" --key "rex/releases/$RELEASE_ID/rex/release.json" /dev/null > /dev/null 2>&1
