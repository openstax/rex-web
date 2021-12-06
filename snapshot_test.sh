# snapshot testing

shopt -s globstar nullglob
for input_file in abl-snapshots/*.input.json; do
    snapshot_file=${input_file%.input.json}.snapshot.json
    
    json=$(cat $input_file)
    node script/entry.js transform-approved-books-data --data "$json" > "$snapshot_file"
done
shopt -u globstar nullglob