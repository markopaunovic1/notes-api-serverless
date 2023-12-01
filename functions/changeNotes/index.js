const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
import middy from '@middy/core';
const { validateToken } = require('../middleware/auth');

const changeNotes = async (event, context) => {
    const note = JSON.parse(event.body);
    const modifiedAt = new Date().toDateString();

    note.modifiedAt = `${modifiedAt}`;

    try {
      if (event?.error && event?.error === "401") {
        return sendResponse(401, { success: false, message: "Invalid token" });
      }

      const params = {
        Tablename: "notes-db",
      };
    } catch (error) {

    }
}

export const handler = middy(changeNotes)
    .use(validateToken)