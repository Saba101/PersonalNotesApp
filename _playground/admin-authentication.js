/* middleware function
   checks if the user sending the requets is admin */

var { User } = require('../../models/users');

var authenticate = (req, res, next) => {

    var token = req.header('x-auth');
    User.findByToken(token, 'auth-admin').then((user) => {
        if (!user) {
            res.status(400).json({
                error: "You aren't authorized for this request!"
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