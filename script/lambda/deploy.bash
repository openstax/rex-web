

aws cloudformation update-stack \
  --template-body file://cfn.yml \
  --stack-name "$1" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=BucketName,ParameterValue=sandbox-unified-web-primary ParameterKey=BucketRegion,ParameterValue=us-east-1 ParameterKey=PublicUrl,ParameterValue=/rex/releases/test/2021-12-08 ParameterKey=ReleaseId,ParameterValue=test/2021-12-08 ParameterKey=CodeVersion,ParameterValue=test ParameterKey=LambdaContainerImage,ParameterValue=373045849756.dkr.ecr.us-east-1.amazonaws.com/rex:20211208_1633

