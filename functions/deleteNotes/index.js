const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
import middy from '@middy/core';
const { validateToken } = require('../middleware/auth');

const deleteNotes = async (event, context) => {
    const currentUser = event?.username;
    
    try {
      if (event?.error && event?.error === '401') {
        return sendResponse(401, { success: false, message: 'Invalid token' });
      }
  
      // Input from Insomnia
      const note = JSON.parse(event.body);
      const { id, username } = note;
  
      const getItemParams = {
        TableName: 'notes-db',
      };
  
      // Scanning through 'notes-db' table
      const result = await db.scan(getItemParams).promise();
  
      // Finds the ID of the item
      const itemToDelete = result.Items.find((item) => item.id === id);
  
      // If item not found return 404
      if (!itemToDelete) {
        return sendResponse(404, { message: 'Note ID not found, please try again.' });
      }

      // Checks if the current user has authorization to delete users note
      if (currentUser !== username || itemToDelete.username !== username) {
        return sendResponse(403, {success: false, message: "No access to delete this item."})
      } 
  
      const deleteItemParams = {
        TableName: 'notes-db',
        Key: {
          id: itemToDelete.id,
        },
      };
      
      // Deletes the current logged in users note and returns 200 if succeeded
      await db.delete(deleteItemParams).promise();
  
      return sendResponse(200, { success: true, message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error deleting item: ', error);
      return sendResponse(400, { success: false, message: 'Failed deleting item' });
    }
  };
  
  export const handler = middy(deleteNotes).use(validateToken);