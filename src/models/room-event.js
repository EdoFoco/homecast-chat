var crypto = require('crypto');

class RoomEvent {
    constructor(room, socketId, user, type, meta){
        var time = Date.now();
        var eventId = `${time.toString()}:${type}:${crypto.randomBytes(7).toString('hex')}`;
       
        this.room = room;
        this.socketId = socketId;
        this.user = user;
        this.type = type;
        this.time = time;
        this.eventId = eventId;
        
        for(var key in meta) {
            this[key] = meta[key];
		}
    }
}

module.exports = RoomEvent;
