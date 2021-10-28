const { User } = require('../../models/users');
const _ = require('lodash');

var updateUser = (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['email', 'userName', 'fullName', 'type', 'phoneNumber', 'gender', 'password']);

    if (!ObjectID.isValid(id)) {
        console.log('Id enterd is invalid');
        return res.status(400).send(err);
    }

    User.findOneAndUpdate({
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
            console.log(user);
            res.send({ user });

        })
        .catch((e) => {
            res.status(400).send();
        });
}

module.exports = { updateUser };