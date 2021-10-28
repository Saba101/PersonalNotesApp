var { User } = require('../../models/users');

var authenticate = (req, res, next) => {

    var token = req.header('x-login-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            res.status(400).json({
                error: "Incorrect Token OR Not Logged In. Please check!"
            });
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();

    }).catch((e) => {
        res.status(401).send();
    });

};

module.exports = { authenticate };