const { User } = require('../../models/users');

var deleteUser = (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Id enterd is invalid');
        return res.status(400).send(err);
    }

    User.findOneAndRemove({
        _id: id

    }).then((user) => {
        if (!user) {
            res.status(404).send();
            return console.log('user not found');
        }
        console.log(user);
        res.send(`Deletetion Successful! ${user}`);

    })
        .catch((e) => {
            res.status(400).send();
        });
};

module.exports = { deleteUser };