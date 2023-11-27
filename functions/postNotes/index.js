const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const note = JSON.parse(event.body);

    const timeStamp = new Date().getTime();
    const createdNote = new Date().toDateString();

    note.id = `${timeStamp}`;
    note.createdAt = `${createdNote}`;
    

    try {
        await db.put({
            TableName: 'notes-db',
            Item: note
        }).promise();

        return sendResponse(200, {success: true, body: note});
    } catch (error) {
        return (sendResponse(500, {success: false, message: "Could\'nt add note, try again"}));
    }
}