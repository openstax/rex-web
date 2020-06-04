set -ex

bucket=sandbox-unified-web-primary
production_url=https://openstax.org
stack_region=us-east-1

release_id=$(curl "${production_url}/rex/release.json" | jq .id -r)
#release_id=master/5333be8
# env_name=$(aws cloudformation describe-stacks --region $stack_region --query \
#   "Stacks[?Parameters[?(ParameterKey=='RexReleaseId' && ParameterValue=='$release_id')]] \
#   |[0].Parameters[?ParameterKey=='EnvName'] \
#   |[0].ParameterValue")

#echo "$stack"
#aws s3api list-buckets --query "Buckets[].Name"
#--query "Contents[?contains(Key, 'rex')]"
#
files=$(aws s3api list-objects --bucket "$bucket" --prefix "rex/releases/$release_id/books/" | jq -r '.Contents[] | .Key')

while IFS= read -r line; do
  $line
done <<< "$files"
# entries |  | \ 
#   while read key 
#   do
#     echo "$key"
#     echo "keyssssssss---------"
#   done



# for entry in $(jq '.Contents | keys | .[]' <<< "$entires"); do
#   name=$($entry | jq .Key)
#   echo "$name"
# done

# for book in $books; do
#   echo "$book"
# done
