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
      ScanIndexForward: false
    }).promise();

    var events = result.Items;
    var eventsBySocketId = {};
    events.forEach((event) => {
      if(!(event.socketId in eventsBySocketId)){
        eventsBySocketId[event.socketId] = [];
      }

      if(event.type == 'left room' && event.socketId in eventsBySocketId){
        delete eventsBySocketId[event.socketId];
      }

      if(event.type == 'join room'){
        eventsBySocketId[event.socketId].push(event);
      }
    });

    return eventsBySocketId;
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
     
     }).promise();

    return result.Count == 1 ? result.Items[0] : null;
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



