const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not valid'
        }
    },
    userName: {
        type: String,
        // required: [true, "can't be blank"],
        // match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        // unique: true,
        // minlength: 3,
        // trim: true
    },
    fullName: {
        type: String,
        required: true
    },
    type: {
        //admin | user
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    phoneNumber: {
        type: String,
        required: true,
        default: null
    },
    gender: {
        type: String,
        trim: true,
        default: null
    },
    password: {
        type: String,
    },
    adminAuth: {
        access: {
            type: Boolean,
            default: false
        },
        token: {
            type: String
        }
    },
    login: {
        status: {
            type: Boolean,
            default: false
        },
        token: {
            type: String
        },
        loginAttempts: {
            type: Number,
            default: 0,
            max: 3
        },
    },
    blocked: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'Users'
});

//Overwrite Metthod**
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    if (user.type == 'user') {
        return _.pick(userObject, ['_id', 'email'])
    }

    return _.pick(userObject, ['_id', 'email'])
}

/*UserSchema.statics.findByToken = function (token, auth) {
    var user = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (e) {
        return Promise.reject();
    }

    return user.findOne({
        '_id': decoded._id,
        'authToken.token': token,
        'authToken.access': auth
    });
}; */

//for login
UserSchema.methods.generateLoginToken = function () {
    var user = this;
    var status = true;

    var token = jwt.sign({ _id: user._id.toHexString(), status }, process.env.JWT_LOGIN_SECRET).toString();
    user.login.status = true;
    user.login.token = token;

    console.log(user);

    return user.save().then(() => {
        console.log("Login successful!");
        return token;
    });
};

UserSchema.statics.findByToken = function (token) {
    var user = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_LOGIN_SECRET);
        // console.log("decoded successfully!");

        return user.findOne({
            '_id': decoded._id,
            'login.token': token,
            'login.status': true
        });

    } catch (e) {
        console.log("Bad Request - Token isn't yours?");
        return Promise.reject();
    }
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            res.status(400).send("User not found!");
            return Promise.reject();
        }
        if (user.blocked == true) {
            res.status(401).send("Your account is temporarily blocked. Please contact admin!");
            // res.redirect('/'); 
            return Promise.reject();
        }
        else {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        //email found - user not blocked - attempts not max - password okay
                        resolve(user);

                    } else {  //if password is incorrect
                        if (user.login.loginAttempts == 3) {
                            //so this is 4th one now block this stupid/fraud user! xd
                            user.blocked = true;
                            res.status(401).send("Your account is temporarily blocked. Please contact admin!");
                            reject();
                        }
                        user.login.loginAttempts + 1;
                        res.status(401).send("Unauthorized Request:  using wrong credentials");
                        reject();
                    }
                })
            });
        }
    });
}

//for admin credentials only
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = true;

    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_ADMIN_SECRET).toString();
    user.adminAuth.access = access;
    user.adminAuth.token = token;

    // return user.save().then(() => {
    //     return token;
    // });
};

UserSchema.statics.verifyAdmin = function (token) {
    var user = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return user.findOne({
        '_id': decoded._id,
        'adminAuth.token': token,
        'adminAuth.access': decoded.access
    });
}

UserSchema.methods.removeToken = function (token) {
    // $pull: //allows you to remove things from array
    var user = this;

    return user.update({
        login: {
            $pull: {
                token: { token }
            },
            $set: {
                status: false
            }
        }
    });

}

var User = mongoose.model('User', UserSchema);
module.exports = { User };