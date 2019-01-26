var config = require('../config');

class RequestLogger {

    constructor(){
        this.isVerbose = config.VERBOSE_REQUEST_LOGGING;
    }

    logRequest(startTime, endTime, socketId, command, success, request, error){
        var timeTaken = (endTime - startTime) / 1000;

        var log = {
            socketId: socketId,
            command: command,
            succes: success,
            timeTaken: timeTaken,
            request: error || this.isVerbose ? request : null,
            error: error,
            date: new Date().toISOString()
        }

        if(error){
            console.error(log);
        }
        else{
            console.log(log);
        }
    }   
}

module.exports = new RequestLogger();
