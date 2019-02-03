module.exports = {
    //Inbound
    ON_CONNECT: 'connection',
    ON_DISCONNECT: 'disconnect',
    
    ON_JOIN: 'join room',
    ON_LEAVE_ROOM: 'leave room',
    
    ON_ADD_STREAM: 'add stream',
    ON_REMOVE_STREAM: 'remove stream',
    ON_GET_ROOM_DETAILS: 'get room details',
    
    ON_SEND_MESSAGE: 'send message',

    //Outbound
    PARTICIPANT_JOINED: 'participant joined',
    PARTICIPANT_LEFT: 'participant left',
    NEW_MESSAGE: 'new message',
    STREAM_ADDED: 'stream added',
    STREAM_REMOVED: 'stream removed',
    ROOM_DETAILS: 'room details',
    MESSAGE_SENT: 'message sent'
};

