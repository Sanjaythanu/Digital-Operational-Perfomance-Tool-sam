const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    assignedUser: {
        type: String,
        required: true
    },
    performanceScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Operation', operationSchema);
