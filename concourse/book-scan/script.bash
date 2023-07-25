#!/usr/bin/env bash

set -eux

release_number=$(< release-issue/number.txt)

cd rex-web

yarn

node script/entry.js domVisitor errorsExist --rootUrl="https://release-${release_number}.sandbox.openstax.org" --queryString="validateLinks"
