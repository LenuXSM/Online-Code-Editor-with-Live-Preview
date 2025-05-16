const mongoose = require('mongoose');

const ChangeHistorySchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    userId: {
        type: String,
        default: 'anonymous'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    htmlContent: String,
    cssContent: String,
    jsContent: String,
    message: {
        type: String,
        default: 'Automatyczny zapis'
    }
});

module.exports = mongoose.model('ChangeHistory', ChangeHistorySchema);
