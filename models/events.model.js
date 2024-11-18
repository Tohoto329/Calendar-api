const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    summary: { type: String, required: true },
    date: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    loaction: { type: String },
    priority: { type: String,required: true},
});

module.exports = mongoose.model('events', eventsSchema,'events');
