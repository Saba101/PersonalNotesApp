const { Note } = require('../../models/notes');
const _ = require('lodash');

var updateNote = function (req, res) {
    var id = req.params.id;  //note's id
    var body = _.pick(req.body, ['text', 'done']);

    if (!ObjectID.isValid(id)) {
        console.log('Invalid Note Id');
        return res.status(400).send(err);
    }

    Note.findOneAndUpdate({
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
            console.log("updated", note);
            res.status(200).json({
                message: "Updation Successful!",
                note
            });
        })
        .catch((e) => {
            res.status(400).send();
        });
}


module.exports = {
    updateNote
};