# Local RoomeEvents table
RESULT=$(aws dynamodb describe-table \
  --region us-east-1 \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name test_RoomEvents)
CODE=$?
if [ $? -eq 0 ]; then
  aws dynamodb delete-table \
    --region eu-west-2 \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --table-name test_RoomEvents
fi
aws dynamodb create-table \
  --region eu-west-2 \
  --endpoint-url $DYNAMODB_ENDPOINT \
  --table-name test_RoomEvents \
  --key-schema AttributeName=room,KeyType=HASH AttributeName=eventId,KeyType=RANGE \
  --attribute-definitions AttributeName=room,AttributeType=S AttributeName=eventId,AttributeType=S \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10
