// models/sessionModel.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    interval: { type: Number, default: 30000 }, // Default interval in milliseconds
    isActive: { type: Boolean, default: true },
    collectionName: { type: String, required: true }
});

module.exports = mongoose.model('Session', sessionSchema);
