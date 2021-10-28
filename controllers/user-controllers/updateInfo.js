const { User } = require('../../models/users');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

var updateInfo = (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['fullName', 'phoneNumber']);

    if (!ObjectID.isValid(id)) {
        console.log('Id enterd is invalid');
        return res.status(400).send(err);
    }
    console.log("Only phone no. and name will be updated by user.");
    User.findOneAndUpdate(
        {
            _id: id
        },
        {
            $set: body
        },
        {
            new: true
        })
        .then((user) => {
            if (!user) {
                res.status(404).send();
                return console.log('user not found');
            }
            res.status(200).send("Updation Successful!");
            // json({
            //     msg: "Updation Successful!",
            //     updated_user: user
            // });

        })
        .catch((e) => {
            res.status(400).send();
        });
}

module.exports = { updateInfo };