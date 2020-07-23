aws s3api get-object --bucket "$PROD_UNIFIED_S3_BUCKET" --key "rex/releases/$RELEASE_ID/rex/release.json" tmp 2> /dev/null
