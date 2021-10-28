const { User } = require('../../models/users');

var getAllUsers = (req, res) => {
    console.log("getting all of your user..")

    User.find({}).then((users) => {
        res.send({ users });
    }, (err) => {
        res.status(400).send(err);
        console.log('Unable to fetch data: ', err);
    });
};

var getUser = (req, res) => {

    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Id enterd is invalid');
        return res.status(400).send(err);
    }

    User.findOne({
        _id: id

    }).then((user) => {
        if (!user) {
            res.status(404).send();
            return console.log('User not found in database');
        }

        console.log(user);
        res.send({ user });

    }).catch((e) => {
        res.status(400).send();
    });
};

module.exports = { getAllUsers, getUser };
