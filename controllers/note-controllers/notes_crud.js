const { Notes } = require('../../models/notes');
const _ = require('lodash')

var createNote = function (req, res) {
    var note = new Note({
        text: req.body.text,
        _creator: req.user._id
    });

    note.save()
        .then((doc) => {
            res.send(doc);
            console.log('Note saved!\n', doc);

        }, (err) => {
            res.status(400).send(err);
            console.log('Unable to save data: ', err);
        });
}

var getNotes = function (req, res) {
    Notes.find({
        _creator: req.user._id

    }).then((notes) => {
        res.send({ notes });
    }, (err) => {
        res.status(400).send(err);
        console.log('Unable to fetch data: ', err);
    });
}

var updateNote = function (req, res) {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'done']);

    if (!ObjectID.isValid(id)) {
        console.log('Invalid Note Id');
        return res.status(400).send(err);
    }

    Notes.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    },
        {
            $set: body
        },
        {
            new: true
        })
        .then((note) => {
            if (!note) {
                res.status(404).send();
                return console.log('note not found');
            }
            console.log(note);
            res.send({ note });

        })
        .catch((e) => {
            res.status(400).send();
        });
}

var deleteNote = function (req, res) {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Id enterd is invalid');
        return res.status(400).send(err);
    }

    Notes.findOneAndRemove({
        _id: id,
        _creator: req.user._id

    }).then((note) => {
        if (!note) {
            res.status(404).send();
            return console.log('note not found');
        }
        console.log(note);
        res.send({ note });

    })
        .catch((e) => {
            res.status(400).send();
        });
}

module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote
};