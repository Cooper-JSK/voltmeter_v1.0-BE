// models/dataModel.js
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    adc0: { type: Number, required: true },
    volts0: { type: Number, required: true },
    adc1: { type: Number, required: true },
    volts1: { type: Number, required: true },
    adc2: { type: Number, required: true },
    volts2: { type: Number, required: true },
    adc3: { type: Number, required: true },
    volts3: { type: Number, required: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Data', dataSchema);
