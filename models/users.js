const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
// const bcrypt = require('bcryptjs');
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
    user.login.push({ status, token });

    return user.save().then(() => {
        return token;
    });
};

UserSchema.statics.findByToken = function (token) {
    var user = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_LOGIN_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return user.findOne({
        '_id': decoded._id,
        'login.token': token,
        'login.status': true
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            })
        });
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

UserSchema.statics.removeToken = function (token) {
    // $pull: //allows you to remove things from array
    var user = this;

    user.update({
        login: {
            $pull: {
                token: { token }
            },
            $set: {
                status: false
            }
        }
    })
}

var User = mongoose.model('User', UserSchema);
module.exports = { User };