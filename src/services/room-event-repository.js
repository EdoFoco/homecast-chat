var AWS = require('aws-sdk');
var _ = require('lodash');
var config = require('../config');

class RoomEventRepository {
  constructor() {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: config.REGION,
      endpoint: config.DYNAMODB_ENDPOINT || 'http://dynamodb-local:8000'
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

  /**
    * Fetch a list of the room events in a room
    *
    * @param {object} where
    *   @param {string} where.room
    *   @param {string} where.socket
  **/
  async listFromRoom(where) {
    var messages;
    try {
      messages = await this.dynamoDB.query({
        TableName: this.tableName,
        KeyConditionExpression: 'room = :room',
        Limit: 20,
        ExpressionAttributeValues: {
          ':room': where.room
        },
        ExclusiveStartKey: where.message ? where : undefined,
        ScanIndexForward: false // Always return newest items first
      }).promise();
    }
    catch (e) {
      console.error(e);
      throw e;
    }
    return {
      next: _.get(messages, 'LastEvaluatedKey'),
      messages: messages.Items.map(function (message) {
        return {
          message: RoomEventRepository.message,
          avatar: RoomEventRepository.avatar,
          username: RoomEventRepository.username,
          content: JSON.parse(RoomEventRepository.content),
          time: RoomEventRepository.time,
          room: RoomEventRepository.room
        };
      })
    };
  }
}

module.exports = new RoomEventRepository();



