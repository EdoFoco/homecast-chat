
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

## Docker Build
### Build
docker build -t chat .

### Run
docker run -d --name chat -p 3000:3000 chat

### Verify it's running
docker ps


##Deploying to AWS using Docker

### Setup Docker
- Create a repository in AWS ECR
- Then follow the commands from 'View Push Commands' button in AWS console and push the image to Docker

### Run CloudFormation using template
- aws cloudformation deploy --stack-name=production --template-file=recipes/public-vpc.yml --capabilities=CAPABILITY_IAM
- Create a new stack via the UI uploading the public-service.yml template, it's easier to insert parameters
- Change the following params: 
--- Container Port: 3000
--- Desired Count: 1 (2 when I do auto scaling)
--- Service Name: homecast-chat-prod
--- Stack Name: homecast-chat-vpc-prod (the name of the parent)



