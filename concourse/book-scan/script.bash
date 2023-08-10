#!/usr/bin/env bash

set -eux

cloudfront_environment=$(< cloudfront-environment/version.txt)

cd /code

node script/entry.js domVisitor errorsExist --rootUrl="https://$cloudfront_environment" --queryString="validateLinks"
