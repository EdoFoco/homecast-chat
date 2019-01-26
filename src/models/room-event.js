var crypto = require('crypto');

class RoomEvent {
    constructor(room, socketId, user, type, content){
        var time = Date.now();
        var eventId = `${time.toString()}:${type}:${crypto.randomBytes(7).toString('hex')}`;
       
        this.room = room;
        this.socketId = socketId;
        this.user = user;
        this.type = type;
        this.content = content;
        this.time = time;
        this.eventId = eventId;
    }
}

module.exports = RoomEvent;
