
url=$(aws cloudformation describe-stacks --stack-name "$1" | jq -r '.Stacks[0].Outputs[]|select(.OutputKey = "Queue").OutputValue')

aws sqs send-message --queue-url "$url" --message-body "$(< /dev/stdin)"
