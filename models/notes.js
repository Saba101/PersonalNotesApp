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

var Note = mongoose.model('Notes', notesSchema);
module.exports = { Note };