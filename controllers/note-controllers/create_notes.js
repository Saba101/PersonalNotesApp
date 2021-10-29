const { Note } = require('../../models/notes');
// const _ = require('lodash');

var createNote = (req, res) => {
    var note = new Note(req.body);
    note._creator = req.user._id;
    console.log(note);

    note.save().then((doc) => {
        res.status(200).send(doc);
        console.log('Note saved!\n', doc);

    }, (err) => {
        res.status(400).send(err);
        console.log('Unable to save note: ', err);
    });
};

module.exports = {
    createNote
};