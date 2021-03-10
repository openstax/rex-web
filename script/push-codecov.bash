#!/usr/bin/env bash
set -x

if [[ ${CI} = true ]]; then 
  yarn codecov
fi