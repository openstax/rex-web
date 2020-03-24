#!/bin/bash

destination=$(pwd)/release

cd /code || exit 111

yarn prerender || exit

cp -r build/* "$destination"
