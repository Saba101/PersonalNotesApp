const { User } = require('../../models/users');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const generator = require('generate-password');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// console.log(process.env.JWT_PAS_GENERATOION_KEY);

var register = (req, res) => {
    console.log("register user..")

    console.log(req.body);
    var body = _.pick(req.body, ['email', 'userName', 'fullName', 'type', 'phoneNumber', 'gender']);

    const email = body.email;
    User.findOne({ email }).then((user) => {
        if (user) {
            return res.status(400).json({
                error: "User with this email already exists"
            });
        }

        var link = null;
        var token = jwt.sign(body, process.env.JWT_PAS_GENERATOION_KEY, { expiresIn: '15m' });
        crypto.randomBytes(35, (err, buf) => {
            if (err) throw err;
            link = `${process.env.CLIENT_URL}/gen-password/${buf.toString('hex')}/${token}`
            res.status(200).json({
                Message: "Use below link for automatic password generation",
                Link: link,
                // Description: "This is our safetly protocol to ensure your account is safe with us."
                Description: "This is our safetly protocol to ensure your account is safe with us\n**The link will expire in 15 minutes**"
            });
        });

    });
}

var passwordGenerator = (req, res) => {
    var token = req.params.token;
    console.log(token);

    jwt.verify(token, process.env.JWT_PAS_GENERATOION_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(400).json({ error: "Incorrect or Expired Link!" });
        }
        console.log("Hurray!");


        //generate password for user 
        //then hash it
        var password = generator.generate({
            length: 8,
            numbers: true,
            symbols: false,
            lowercase: true,
            uppercase: true
        });

        var original_password = password;
        bcrypt.genSalt(7, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                // console.log(hash);
                password = hash;
                var user = new User(decodedToken);
                user.password = password;
                if (user.type == 'admin') {
                    user.generateAuthToken();
                }
                console.log(user);

                user.save((err) => {
                    console.log('saving user');
                    if (err) {
                        console.log("Error in signup: ", err);
                        return res.status(400).json({
                            error: "Error in registrating user to database. Try Again!"
                        });
                    }
                    res.json({
                        message: "Registration successful!",
                        user: {
                            _id: user.id,
                            email: user.email,
                            password: original_password
                        },
                        note: "**Save Your Password with you for future use**"
                    });

                })
            });
        });

    });

};

module.exports = { register, passwordGenerator };