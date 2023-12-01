const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
import middy from '@middy/core';
const { validateToken } = require('../middleware/auth');

const postNotes = async (event, context) => {
    const note = JSON.parse(event.body);

    // creates a ID as a timestamp and a formattedDate when note was created
    const timeStamp = new Date().getTime();

    function formatDate(date) {
        const options = {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        };    
        return new Date(date).toLocaleDateString('en-en', options);
      }
      const formattedDate = formatDate(new Date());

    note.id = `${timeStamp}`;
    note.createdAt = `${formattedDate}`;
    note.username = event.username;

    if (note.title.length > 50) {
        return sendResponse(400, {success: false, message: "Title can only have up to 50 letters"})
    }

    if (note.text.length > 300) {
        return sendResponse(400, {success: false, message: "Text can only have up to 300 letters"})
    }
    
    try {

        if (event?.error && event?.error === '401') {
            return sendResponse(401, {success: false, message: 'Invalid token'});
        }
        
        // Posting a new note in the table
        await db.put({
            TableName: 'notes-db',
            Item: note
        }).promise();

        return sendResponse(200, {success: true, body: note});
    } catch (error) {
        return (sendResponse(500, {success: false, message: "Could\'nt add note, try again"}));
    }
}

export const handler = middy(postNotes)
    .use(validateToken)