#!/bin/bash

shopt -s globstar nullglob
for input_file in ./*.input.json; do
    snapshot_file=${input_file%.input.json}.snapshot.json
    
    json=$(cat "$input_file")
    node ../script/entry.js transform-approved-books-data --data "$json" > "$snapshot_file"
done
shopt -u globstar nullglob