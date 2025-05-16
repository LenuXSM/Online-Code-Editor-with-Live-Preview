const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['General', 'Frontend', 'CSS', 'JavaScript', 'React', 'Vue', 'Other'],
        default: 'General'
    },
    htmlContent: String,
    cssContent: String,
    jsContent: String,
    isPublic: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        default: 'system'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Template', TemplateSchema);
