# Local RoomeEvents table
RESULT=$(aws dynamodb describe-table \
  --region eu-west-2 \
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
    --attribute-definitions AttributeName=room,AttributeType=S AttributeName=eventId,AttributeType=S AttributeName=socketId,AttributeType=S \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
    --global-secondary-indexes IndexName=SocketIdIndex,KeySchema=["{AttributeName=socketId,KeyType=HASH}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=10,WriteCapacityUnits=10}"

#aws dynamodb create-table --region eu-west-2 --endpoint-url http://localhost:8000 --table-name test_RoomEvents --key-schema AttributeName=room,KeyType=HASH AttributeName=eventId,KeyType=RANGE --attribute-definitions AttributeName=room,AttributeType=S AttributeName=eventId,AttributeType=S AttributeName=socketId,AttributeType=S --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 --global-secondary-indexes IndexName=SocketIdIndex,KeySchema=["{AttributeName=socketId,KeyType=HASH}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=10,WriteCapacityUnits=10}"