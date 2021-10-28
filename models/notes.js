const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    done: {
        type: Boolean,
        default: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    collection: 'Notes'
});

module.exports = mongoose.model('Note', notesSchema);