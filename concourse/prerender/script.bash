#!/bin/bash

DESTINATION=`pwd`/release

cd /code

yarn prerender

cp -r build/* $DESTINATION
