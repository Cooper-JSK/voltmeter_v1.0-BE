// controllers/dataController.js
const mongoose = require('mongoose');
const Session = require('../models/sessionModel');
const { publishInterval } = require('../config/mqtt');

exports.getData = async (req, res) => {
    const { sessionId } = req.params;
    console.log(`Received request for session ID: ${sessionId}`);

    try {
        const session = await Session.findById(sessionId);
        if (!session) {
            console.log('Session not found');
            return res.status(404).json({ error: 'Session not found' });
        }
        console.log(`Session found: ${session.collectionName}`);

        const collection = mongoose.connection.collection(session.collectionName);
        const data = await collection.find().sort({ timestamp: -1 }).limit(10).toArray();

        console.log(`Data retrieved: ${JSON.stringify(data)}`);
        res.json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


// Set the publish interval for a specific session
exports.setInterval = async (req, res) => {
    const { sessionId } = req.params;
    const { interval } = req.body;

    try {
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        session.interval = interval;
        await session.save();

        publishInterval(interval); // Adjust this if needed for session-specific intervals

        res.json({ message: `Interval set to ${interval} ms for session ${session.name}` });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Save data to the active session's collection
exports.saveData = async (sessionId, data) => {
    try {
        const session = await Session.findById(sessionId);
        if (!session || !session.isActive) {
            throw new Error('Session not found or inactive');
        }

        const collection = mongoose.connection.collection(session.collectionName);
        await collection.insertOne(data);

        console.log('Data saved to session collection:', session.collectionName);
    } catch (err) {
        console.error('Error saving data:', err);
    }
};
