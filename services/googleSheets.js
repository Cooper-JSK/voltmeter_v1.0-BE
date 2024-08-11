// services/googleSheets.js
const axios = require('axios');
require('dotenv').config();

const sendToGoogleSheets = async (data) => {
    try {
        await axios.post(process.env.GOOGLE_SHEETS_URL, data);
        console.log('Data sent to Google Sheets');
    } catch (err) {
        console.error('Failed to send data to Google Sheets', err);
    }
};

module.exports = { sendToGoogleSheets };
