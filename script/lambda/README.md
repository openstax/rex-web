
once per account:
```
aws cloudformation deploy --template-file cfn.repository.yml --stack-name rex-ecr-repo
```


to enqueue a whole book:
```
for route in $(node ../entry.js dump-book-routes 031da8d3-b525-429c-80cf-6c8ed997733a | jq -rc .[]); do ./pushrender.bash rextest1 <<< "$route"; ./pushrender.bash rextest1 <<< "$route"; done
```
