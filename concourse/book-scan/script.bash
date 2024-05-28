#!/usr/bin/env bash

set -eux

cloudfront_environment=$(< cloudfront-environment/version.txt)

cd rex-web

yarn install --network-timeout 60000

node script/entry.js domVisitor errorsExist --rootUrl="https://$cloudfront_environment" --queryString="validateLinks"
