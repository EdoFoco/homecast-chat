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
            
            await RoomEventRepository.add(roomEvent);
            socket.join(jsonRequest.room);

            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_JOIN, true, request, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_JOIN, false, request, e);
        }
    }

    async sendMessage(socket, request) {
        var start = +new Date();
       
        try{
            var jsonRequest = JSON.parse(request);

            for (var key in socket.rooms) {
               if(key != socket.id){
                    jsonRequest.room = key;
               }
            }
            
            var roomEvent = new RoomEvent(jsonRequest.room, socket.id, jsonRequest.user, Commands.ON_NEW_MESSAGE, request);
            await RoomEventRepository.add(roomEvent);

            socket.to(jsonRequest.room).emit('new message', JSON.stringify(request));
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_NEW_MESSAGE, true, request, null);
        }
        catch(e){
            RequestLogger.logRequest(start, +new Date(), socket.id, Commands.ON_NEW_MESSAGE, false, request, e);
        }
    }

}

module.exports = new RoomEventsController();


