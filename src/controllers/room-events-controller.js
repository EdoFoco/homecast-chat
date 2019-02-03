var RoomEventRepository = require('../services/room-event-repository');
var Commands = require('../enums/commands');
var RequestLogger = require('../services/request-logger');
var RoomEvent = require('../models/room-event');

class RoomEventsController {
    
    async joinRoom(socket, request) {
        var start = +new Date();
       
        try{
            var jsonRequest = JSON.parse(request);
            var roomEvent = new RoomEvent(jsonRequest.room, socket.id, jsonRequest.user, Commands.ON_JOIN, null);
            
            socket.join(jsonRequest.room);
            await RoomEventRepository.add(roomEvent);
            var participants = await RoomEventRepository.getParticipants(jsonRequest.room);
            var newParticipant = participants.find(p => p.socketId == socket.id );
            var response = {
                newParticipant: { socketId: newParticipant.socketId, user: newParticipant.user, time: newParticipant.time },
                participants: participants
            };

            socket.to(jsonRequest.room).emit(Commands.PARTICIPANT_JOINED, JSON.stringify(response));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_JOIN, true, request, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_JOIN, false, request, e);
        }
    }

    async leaveRoom(socket){
        var start = +new Date();

        try{
            //Get User info for message
            var userJoinedEvent = await RoomEventRepository.getUserJoinedEvent(socket.id);
            if(!userJoinedEvent){
                RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_LEAVE_ROOM, false, null, 'WARN: User connected but never joined a room');
                return;
            }

            var roomEvent = new RoomEvent(userJoinedEvent.room, socket.id, userJoinedEvent.user, Commands.ON_LEAVE_ROOM);
            await RoomEventRepository.add(roomEvent);

            //Check if user added stream
            var userAddedStreamEvent = await RoomEventRepository.getUserAddedStreamEvent(socket.id);
            if(userAddedStreamEvent){
                console.log('User Added Stream Event: ', userAddedStreamEvent);
                var roomEvent = new RoomEvent(userJoinedEvent.room, socket.id, userJoinedEvent.user, Commands.ON_REMOVE_STREAM, { streamId: userAddedStreamEvent.streamId });
                await RoomEventRepository.add(roomEvent);
                socket.to(userJoinedEvent.room).emit(Commands.STREAM_REMOVED, null);
            }
            
            var participants = await RoomEventRepository.getParticipants(userJoinedEvent.room);
            var response = {
                oldParticipant: { socketId: socket.id, user: userJoinedEvent.user, time: +new Date() },
                participants: participants
            };

            socket.to(userJoinedEvent.room).emit(Commands.PARTICIPANT_LEFT, JSON.stringify(response));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_LEAVE_ROOM, true, null, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_LEAVE_ROOM, false, null, e);
        }
    }

    async addStream(socket, request){
        var start = +new Date();
       
        try{
            var jsonRequest = JSON.parse(request);
            var room = this.getRoom(socket);

            var addStreamEvent = new RoomEvent(room, socket.id, jsonRequest.user, Commands.ON_ADD_STREAM, { streamId: jsonRequest.streamId });
            await RoomEventRepository.add(addStreamEvent);
            
            var response = {
                stream: {
                    id: jsonRequest.streamId,
                    user: jsonRequest.user,
                },
                time: addStreamEvent.time
            };

            socket.to(addStreamEvent.room).emit(Commands.STREAM_ADDED, JSON.stringify(response));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_ADD_STREAM, true, null, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_ADD_STREAM, false, request, e);
        }
    }

    async getRoomDetails(socket, request){
        var start = +new Date();

        try {
            var jsonRequest = JSON.parse(request);
            var room = this.getRoom(socket);
            
            var getStreamEvent = new RoomEvent(room, socket.id, jsonRequest.user, Commands.ON_GET_ROOM_DETAILS, null);
            await RoomEventRepository.add(getStreamEvent);

            var streamAddedEvent = await RoomEventRepository.getStreamDetails(room);
            var participants = await RoomEventRepository.getParticipants(room);

            var response = {
                room: room,
                participants: participants,
                stream: !streamAddedEvent ? null : {
                    id: streamAddedEvent.streamId,
                    user: streamAddedEvent.user
                }
            };
            
            socket.emit(Commands.ROOM_DETAILS, JSON.stringify(response));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_GET_ROOM_DETAILS, true, null, null);
        } catch (e) {
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_GET_ROOM_DETAILS, false, request, e);
        }
    }

    async sendMessage(socket, request) {
        var start = +new Date();
       
        try{
            var jsonRequest = JSON.parse(request);
            var room = this.getRoom(socket);
            
            var roomEvent = new RoomEvent(room, socket.id, jsonRequest.user, Commands.ON_SEND_MESSAGE, { message: jsonRequest.message });
            await RoomEventRepository.add(roomEvent);

            socket.to(room).emit(Commands.MESSAGE_SENT, JSON.stringify(request));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_SEND_MESSAGE, true, request, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_SEND_MESSAGE, false, request, e);
        }
    }

    getRoom(socket){
        var room;
        for (var key in socket.rooms) {
            if(key != socket.id){
                 room = key;
            }
         }

        return room;
    }
}

module.exports = new RoomEventsController();


