var AWS = require('aws-sdk');
var bcrypt = require('bcrypt');

function Room() {
  this.saltRounds = 10;
  this.dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: process.env.REGION
  });
  this.tableName = `${process.env.ENV_NAME}_Rooms`;
}
module.exports = new User();

/**
  * Get a user by their username
  *
  * @param {string} username - Username of the user
  * @param {string} password - The user's password
**/
Room.prototype.getByName = async function(roomName) {
  let details = null;

  try {
    details = await this.dynamoDB.get({
      TableName: this.tableName,
      Key: {
        room: roomName
      }
    }).promise();
  } catch (e) {
    console.error(e);

    throw new Error('Failed to lookup room by roomName');
  }

  return details.Item;
};


Room.prototype.create = async function(details) {
  const existingRoom = await this.getByName(details.roomName);

  if (existingRoom) {
    throw new Error('That room is taken already.');
  }

  try {
    await this.dynamoDB.put({
      TableName: this.tableName,
      Item: {
        room: details.roomName,
        email: details.email,
        passwordHash: passwordHash
      }
    }).promise();
  } catch (e) {
    console.error(e);

    throw new Error('Failed to insert new user in database');
  }

  return 'Success';
};

/**
  * Authenticate a user who submits their username and plaintext password
  *
  * @param {object} details
  *   @param {string} details.username
  *   @param {string} details.password
**/
User.prototype.authenticate = async function(details) {
  const account = await this.fetchByUsername(details.username);

  if (!account) {
    throw new Error('No matching account found');
  }

  const passed = await bcrypt.compare(details.password, account.passwordHash);

  if (passed) {
    return {
      username: account.username,
      email: account.email
    };
  }

  return false;
};
