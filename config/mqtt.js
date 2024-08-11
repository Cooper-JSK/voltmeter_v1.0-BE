// config/mqtt.js
const mqtt = require('mqtt');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();


// MQTT client options
const options = {
    cert: fs.readFileSync(process.env.CERT_PATH),
    key: fs.readFileSync(process.env.KEY_PATH),
    ca: fs.readFileSync(process.env.CA_PATH),
    clientId: 'YourUniqueClientID', // Give a unique client ID
    rejectUnauthorized: true, // Ensure that the server certificate is verified
};

const client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

// Track the current active session ID
let activeSessionId = null;

// Function to set the active session ID
const setActiveSession = (sessionId) => {
    activeSessionId = sessionId;
    console.log(`Active session set to: ${activeSessionId}`);
};

client.on('connect', () => {
    console.log('Connected to AWS IoT via MQTT');
    client.subscribe(process.env.MQTT_TOPIC_SUBSCRIBE, (err) => {
        if (err) console.error('Failed to subscribe to topic', err);
    });
});


client.on('message', async (topic, message) => {
    if (!activeSessionId) {
        console.error('No active session to save data.');
        return;
    }

    try {
        const data = JSON.parse(message.toString());

        // Retrieve the active session by its ID
        const session = await mongoose.connection.collection('sessions').findOne({ _id: new mongoose.Types.ObjectId(activeSessionId) });
        if (!session) {
            console.error('Active session not found');
            return;
        }

        // Save data to the active session's collection
        const collection = mongoose.connection.collection(session.collectionName);
        await collection.insertOne(data);

        console.log(`Data saved to session collection (${session.collectionName}):`, data);



    } catch (err) {
        console.error('Error processing MQTT message:', err);
    }
});

// Function to publish interval for the active session
const publishInterval = (interval) => {
    client.publish(process.env.MQTT_TOPIC_PUBLISH, JSON.stringify({ interval }));
};


// Function to get the active session ID (for testing/debugging)
const getActiveSessionId = () => activeSessionId;

module.exports = { client, publishInterval, setActiveSession, getActiveSessionId };
