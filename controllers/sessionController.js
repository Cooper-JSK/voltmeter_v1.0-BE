// controllers/sessionController.js
const Session = require('../models/sessionModel');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const { setActiveSession, publishInterval } = require('../config/mqtt');

const createSession = async (req, res) => {
    const { name, interval } = req.body;

    const collectionName = `session_${Date.now()}`; // Generate unique collection name

    try {
        const newSession = new Session({
            name,
            interval,
            collectionName,
            isActive: false, // Set as inactive initially
        });

        await newSession.save();

        // Dynamically create a new collection for the session
        mongoose.connection.createCollection(collectionName);

        res.status(201).json(newSession);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// New function to start a session
const startSession = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Set the session as active
        session.isActive = true;
        session.startTime = new Date();
        await session.save();

        // Set this session as active in the MQTT handler
        setActiveSession(sessionId);

        // Update the publish interval in the device if needed
        publishInterval(session.interval);

        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const stopSession = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.endTime = new Date();
        session.isActive = false;
        await session.save();

        // Clear the active session
        setActiveSession(null);

        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const downloadSessionData = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const collection = mongoose.connection.collection(session.collectionName);
        const data = await collection.find().toArray();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Session Data');

        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));

        data.forEach(record => worksheet.addRow(record));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${session.name}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await Session.findById(sessionId);
        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { createSession, startSession, stopSession, downloadSessionData, getAllSessions, getSession };
