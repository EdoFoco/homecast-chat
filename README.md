
# Socket.IO Chat

A simple chat demo for socket.io

## How to use

```
$ cd socket.io
$ npm install
$ cd examples/chat
$ npm install
$ npm start
```

And point your browser to `http://localhost:3000`. Optionally, specify
a port by supplying the `PORT` env variable.

## Features

- Multiple users can join a chat room by each entering a unique username
on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leaves
the chatroom.

## Running local env
### Build
docker build -t homecast-chat .

### Create Network
docker network create chat

### Run
docker run -d --net=chat --name redis redis
docker run -d --net=chat --name chat1 -p 3000:3000 -e "REDIS_ENDPOINT=redis" homecast-chat
docker run -d --net=chat --name chat2 -p 3001:3000 -e "REDIS_ENDPOINT=redis" homecast-chat

### Verify it's running
-- docker ps
-- Connect to localhost:3000 and localhost:3001


## Deploying to AWS using Docker and CloudFormation
### Setup pipeline using CloudFormation (Skip this)
- Create a new CF stack using the UI importing pipeline.yml and setting the params:
-- Stack Name: homecast-chat-pipeline
-- ResourceName: homecast-chat (defines the prefix for the resources)
-- Environment: production
-- S3Bucket: homecast-chat-builds (build bucket)
-- S3ObjectKey: homecast-chat.zip

### Setup ECR
- Then follow the commands from 'View Push Commands' button in ECR page and push the image to Docker

### Run CloudFormation using template (If you haven't set up the pipeline already)

- aws cloudformation deploy --stack-name=production --template-file=recipes/cluster.yml --capabilities=CAPABILITY_IAM

- aws cloudformation deploy --stack-name=homecast-chat-prod --template-file=recipes/resources.yml --capabilities=CAPABILITY_IAM

- Create a new stack via the UI uploading the chat-service.yml template, it's easier to insert parameters
- Change the following params: 
--- Container Port: 3000
--- Desired Count: 2 (number of processes)
--- Service Name: homecast-chat-service
--- Stack Name: production (the name of the parent)



