#!/usr/bin/env bash

set -e

update_snapshot=$1
my_dir=$(dirname "$0")

if [[ $1 == '--help' ]]; then
    echo "This script runs a test on multiple input files (*.input.json)"
    echo "and compares each output to a corresponding snapshot file (*.snapshot.json)"
    echo ""
    echo "When the output differs from the snapshot the test fails"
    echo ""
    echo "--update-snapshots      Updates all snapshot files"
    exit 1
fi

shopt -s globstar nullglob
for input_file in "$my_dir"/*.input.json; do
    snapshot_file=${input_file%.input.json}.snapshot.json
    output_file=${input_file%.input.json}.temp.json
    if [[ $update_snapshot || ! -f $snapshot_file ]]; then
        output_file=$snapshot_file
    fi
    
    # -------------------------
    # Actual test goes here
    # -------------------------

    bash "$my_dir/../transform-approved-books-data.bash" \
        <(jq -e '.abl_data' "$input_file") \
        <(jq -e '.configured_books' "$input_file") > "$output_file"

    diff "$snapshot_file" "$output_file"
    
    if [[ "$snapshot_file" != "$output_file" ]]; then
        rm "$output_file"
    fi
done
shopt -u globstar nullglob