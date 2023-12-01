const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
import middy from '@middy/core';
const { validateToken } = require('../middleware/auth');

const changeNotes = async (event, context) => {
    const currentUser = event?.username;
    const note = JSON.parse(event.body);
    const { id, username } = note;

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
      console.log(formattedDate);

    note.modifiedAt = `${formattedDate}`;

    try {
      if (event?.error && event?.error === "401") {
        return sendResponse(401, { success: false, message: "Invalid token" });
      }

      // Checks if the current user has authorization to update users note
      if (currentUser !== username) {
        return sendResponse(403, {success: false, message: "No access to delete this item."})
      } 

      const updateNote = {
        TableName: 'notes-db',
        Key: {
            id: note.id,
        },
        UpdateExpression: 'set #title = :title, #text = :text, #modifiedAt = :modifiedAt',
        ExpressionAttributeNames: {
            '#title': 'title',
            '#text': 'text',
            '#modifiedAt': 'modifiedAt',
          },
          ExpressionAttributeValues: {
            ':title': note.title,
            ':text': note.text,
            ':modifiedAt': note.modifiedAt,
          },
          ReturnValues: 'ALL_NEW',
        };

        // Updates users notes value
        const updateChanges = await db.update(updateNote).promise();

        return sendResponse(200, {success: true, message: 'Note updated successfully', body: updateChanges})
    } catch (error) {
        console.log(error);
        return sendResponse(400, {success: false, message: 'Failed updating note', error: error})
    }
}

export const handler = middy(changeNotes)
    .use(validateToken)