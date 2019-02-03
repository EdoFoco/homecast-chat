var AWS = require('aws-sdk');
var Commands = require('../enums/commands');
var _ = require('lodash');
var config = require('../config');

class RoomEventRepository {
  constructor() {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: config.REGION,
      endpoint: config.DYNAMODB_ENDPOINT || 'http://dynamodb-local:8000/'
    });
    this.tableName = `${config.ENV_NAME}_RoomEvents`;
  }

  /**
    * Add a roomEvent
    *
    * @param {object} roomEvent
    *   @param {string} roomEvent.room
    *   @param {string} roomEvent.type
    *   @param {object} roomEvent.user
    *   @param {object} roomEvent.content
    *   @param {string} roomEvent.socketId
    *   @param {string} roomEvent.eventId
    *    @param {Date} roomEvent.time
  **/
  async add(roomEvent) {
      await this.dynamoDB.put({
        TableName: this.tableName,
        Item: roomEvent
      }).promise();
  }

  async getParticipants(room){
    var result = await this.dynamoDB.query({
      TableName: this.tableName,
      KeyConditionExpression: 'room = :room',
      ExpressionAttributeValues: {
        ':room': room,
        ':joinRoomType':  Commands.ON_JOIN,
        ':leftRoomType':  Commands.ON_LEAVE_ROOM
      },
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      FilterExpression: "#type IN (:joinRoomType, :leftRoomType)",
    }).promise();

    var events = result.Items;
    console.log(events);
    var eventsBySocketId = {};
    events.forEach((event) => {
      if(!(event.socketId in eventsBySocketId)){
        eventsBySocketId[event.socketId] = [];
      }

      if(event.type == Commands.ON_LEAVE_ROOM){
        delete eventsBySocketId[event.socketId];
      }

      if(event.type == Commands.ON_JOIN){
        eventsBySocketId[event.socketId] = event;
      }
    });

    var result = [];
    for (var key in eventsBySocketId) {
       result.push({
         socketId: eventsBySocketId[key].socketId,
         user: eventsBySocketId[key].user,
         time: eventsBySocketId[key].time
       });
    }

    return result;
  }

  async getUserJoinedEvent(socketId){
    var result = await this.dynamoDB.query({
      TableName: 'test_RoomEvents',
      IndexName: 'SocketIdIndex',
      KeyConditionExpression: 'socketId = :socketId',
      ExpressionAttributeValues: {
        ':socketId': socketId,
        ':eventType':  Commands.ON_JOIN,
      },
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      FilterExpression: "#type = :eventType",
      ScanIndexForward: false
     }).promise();

    return result.Count < 1 ? null : result.Items[0];
  }

  async getUserAddedStreamEvent(socketId){
    var result = await this.dynamoDB.query({
      TableName: 'test_RoomEvents',
      IndexName: 'SocketIdIndex',
      KeyConditionExpression: 'socketId = :socketId',
      ExpressionAttributeValues: {
        ':socketId': socketId,
        ':eventType':  Commands.ON_ADD_STREAM,
      },
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      FilterExpression: "#type = :eventType",
      ScanIndexForward: false
    }).promise();

    return result.Count >= 1 ? result.Items[0] : null;
  }

  async getStreamDetails(room){
    var result = await this.dynamoDB.query({
      TableName: 'test_RoomEvents',
      KeyConditionExpression: 'room = :room',
      ExpressionAttributeValues: {
        ':room': room,
        ':onAddStream':  Commands.ON_ADD_STREAM,
        ':onRemoveStream': Commands.ON_REMOVE_STREAM
      },
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      FilterExpression: "#type IN (:onAddStream, :onRemoveStream)"
    }).promise();

    //Get active streams
    var events = result.Items;
    var streamEvents = {};
    events.forEach((event) => {
      if(!(event.streamId in streamEvents)){
        streamEvents[event.streamId] = [];
      }

      if(event.type == Commands.ON_REMOVE_STREAM){
        delete streamEvents[event.streamId];
      }

      if(event.type == Commands.ON_ADD_STREAM){
        streamEvents[event.streamId] = event;
      }
    });

    //Create result array
    var result = [];
    for(var key in streamEvents) {
      result.push(streamEvents[key]);
    }
    
    //Check this is descending order
    result.sort(function(a,b){return b.time - a.time});
    
    if(result.length > 1){
      console.warn(`WARN: There shoud be only one stream for room: ${room}`)
    }

    return result.length >= 1 ? result[0] : null;
  }


  /**
    * Fetch a list of the room events in a room
    *
    * @param {object} where
    *   @param {string} where.room
    *   @param {string} where.socket
  **/
  async getEvents(where) {
      return await this.dynamoDB.query({
        TableName: this.tableName,
        KeyConditionExpression: 'room = :room',
        ExpressionAttributeValues: {
          ':room': where.room
        },
        ScanIndexForward: false // Always return newest items first
      }).promise();
      
  }
}

module.exports = new RoomEventRepository();



