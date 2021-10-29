const { Notes } = require('../../models/notes');
const _ = require('lodash');

var getNotes = function (req, res) {
    Notes.find({
        _creator: req.user._id

    }).then((notes) => {
        res.send({ notes });
    }, (err) => {
        res.status(400).send(err);
        console.log('Unable to fetch data: ', err);
    });
};

module.exports = {
    getNotes
};