const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    htmlContent: {
        type: String,
        default: '<div>\n  <h1>Hello, World!</h1>\n  <p>Start coding here</p>\n</div>'
    },
    cssContent: {
        type: String,
        default: 'body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}'
    },
    jsContent: {
        type: String,
        default: '// JavaScript code here\nconsole.log("Hello from JavaScript!");'
    },
    externalLibraries: [{
        name: String,
        version: String,
        url: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);
