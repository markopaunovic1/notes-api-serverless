const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
import middy from '@middy/core';
const { validateToken } = require('../middleware/auth');

//before: verify token before scaning the table
const getNotes = async (event, context) => {

  // Gets the current user logged in
    const currentUser = event?.username;

    try {
    if (event?.error && event?.error === '401') {
        return sendResponse(401, {success: false, message: 'Invalid token'});
    }

    const params = {
      TableName: 'notes-db'
    };

    // Scanning through 'notes-db' table
    const scannedTable = await db.scan(params).promise();

    // Filters through the table and looking for the username
    const userNotes = scannedTable.Items.filter(note => note.username === currentUser)

    // Getting only the users notes - just paste the Token in the Bearer and press SEND in Insomnia
    if (userNotes.length > 0) {
      return sendResponse(200, {body: userNotes})
    } else {
      return sendResponse(404, {message: "Could not get users note, try again!!!"})
    }
  } catch (error) {
    return sendResponse(500, { success: false, message: "Error fetching user notes" });
  }
}

export const handler = middy(getNotes)
    .use(validateToken)