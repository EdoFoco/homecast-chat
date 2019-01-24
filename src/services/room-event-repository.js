var AWS = require('aws-sdk');
var crypto = require('crypto');
var _ = require('lodash');
var config = require('../config');

function RoomEventRepository() {
  this.dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: config.REGION,
    endpoint: config.DYNAMODB_ENDPOINT
  });
  this.tableName = `${config.ENV_NAME}_RoomEvents`;
}
module.exports = new RoomEventRepository();

/**
  * Add a roomEvent
  *
  * @param {object} roomEvent
  *   @param {string} RoomEventRepository.room
  *   @param {string} RoomEventRepository.type
  *   @param {object} RoomEventRepository.user
  *   @param {object} RoomEventRepository.content
  *   @param {Date} RoomEventRepository.socketId
**/
RoomEventRepository.prototype.add = async function(roomEvent) {
  try {
    var time = Date.now();
    var eventId = time.toString() + ':' + crypto.randomBytes(7).toString('hex');
    await this.dynamoDB.put({
      TableName: this.tableName,
      Item: {
        room: roomEvent.room,
        eventId: eventId,
        user: roomEvent.username,
        type: roomEvent.type,
        content: roomEvent.content,
        time: time,
      }
    }).promise();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to insert new user in database');
  }
};

/**
  * Fetch a list of the room events in a room
  *
  * @param {object} where
  *   @param {string} where.room
  *   @param {string} where.socket
**/
RoomEventRepository.prototype.listFromRoom = async function(where) {
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
  } catch (e) {
    console.error(e);

    throw e;
  }

  return {
    next: _.get(messages, 'LastEvaluatedKey'),
    messages: messages.Items.map(function(message) {
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
};
