var RoomEventRepository = require('../services/room-event-repository');
var Commands = require('../enums/commands');
var RequestLogger = require('../services/request-logger');
var RoomEvent = require('../models/room-event');

class RoomEventsController {
    
    async joinRoom(socket, request) {
        var start = +new Date();
       
        try{
            var jsonRequest = JSON.parse(request);
            var roomEvent = new RoomEvent(jsonRequest.room, socket.id, jsonRequest.user, Commands.ON_JOIN, request);
            
            socket.join(jsonRequest.room);
            await RoomEventRepository.add(roomEvent);
            var participants = await RoomEventRepository.getParticipants(jsonRequest.room);
            
            var response = {
                participant: participants[socket.id],
                activeParticipants: participants
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
            var event = await RoomEventRepository.getUserJoinedEvent(socket.id);
            var roomEvent = new RoomEvent(event.room, socket.id, event.user, Commands.ON_LEAVE_ROOM, null);

            //Check if socket id had stream id
            //Add stream removed event
            //Emit stream removed event
            
            await RoomEventRepository.add(roomEvent);
            var participants = await RoomEventRepository.getParticipants(event.room);
            
            var response = {
                participant: participants[socket.id],
                activeParticipants: participants
            };

            socket.to(event.room).emit(Commands.PARTICIPANT_LEFT, JSON.stringify(response));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_LEAVE_ROOM, true, null, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_LEAVE_ROOM, false, null, e);
        }
    }

    async sendMessage(socket, request) {
        var start = +new Date();
       
        try{
            var jsonRequest = JSON.parse(request);
            var room = this.getRoom(socket);
            
            var roomEvent = new RoomEvent(room, socket.id, jsonRequest.user, Commands.ON_NEW_MESSAGE, request);
            await RoomEventRepository.add(roomEvent);

            socket.to(room).emit(Commands.NEW_MESSAGE, JSON.stringify(request));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_NEW_MESSAGE, true, request, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_NEW_MESSAGE, false, request, e);
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


