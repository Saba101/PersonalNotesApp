const { Note } = require('../../models/notes');
const _ = require('lodash');

var deleteNote = function (req, res) {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Id enterd is invalid');
        return res.status(400).send(err);
    }

    Note.findOneAndRemove({
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
    deleteNote
};