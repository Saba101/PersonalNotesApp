var request = require('request');
const { User } = require('../models/users');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const generator = require('generate-password');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//Create admin credentials automatically..
var admin = new User({
    fullName: "Warka Omen",
    phoneNumber: "0201301241",
    email: "wark02@example.com",
    gender: "female",
    username: "Wak_45",
    type: "admin"
});

request.post('/users/register', admin, (req, res) => {
    console.log("**Creating your admin credentials. Please Wait.... **");
    var body = admin;

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

            var user = new User(body);
            user.password = password;
            if (user.type == 'admin') {
                user.generateAuthToken();
            }
            console.log(user);

            user.save((err) => {
                console.log('saving user');
                if (err) {
                    console.log("Error in signup: ", err);
                    return err;
                }
                console.log("------------------------------------------")
                console.log({
                    message: "Registration successful!",
                    user: {
                        "_id": user.id,
                        "email": user.email,
                        "password": original_password,
                        "x-auth_Header_Token": user.adminAuth.token
                    },
                    note: "**Take Your Password & x-auth token**"
                });
                console.log("------------------------------------------")
            })
        });
    });
});


module.exports = { request };
