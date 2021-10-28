/*create connection with mongoose databse 
  named PersonalNotesApp */

require('./../db');
require("dotenv").config();
require('./adminCredentials.js')

const express = require('express');
const router = require("express").Router();

const { register, passwordGenerator } = require('../controllers/admin-controllers/registration.js');
const { getAllUsers, getUser } = require('../controllers/admin-controllers/get_users');
const { updateUser } = require('../controllers/admin-controllers/update_user.js');
const { deleteUser } = require('../controllers/admin-controllers/delete_user.js');
const { createNotes, getNotes, updateNotes, deleteNotes } = require('../controllers/note-controllers/notes_crud.js');
const { updateInfo } = require('../controllers/user-controllers/updateInfo.js')

const { User } = require('../models/users');
// const { authenticateAdmin } = require('./middlewares/authenticateAdmin');
const _ = require('lodash');


const app = express();
app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is up and running on port ` + process.env.PORT + '...');
});

//Middleware functions
//(1)
var authenticateAdmin = (req, res, next) => {
  var token = req.header('x-auth');
  User.verifyAdmin(token).then((user) => {
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

//(2)
var authenticateUser = (req, res, next) => {
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

//(3)
// var checkUserAttempts = (req, res, next) => {
//   //block user if it tries to login with wrong credentials
//   //after 3 tries..

//   var email = req.body.email;
//   User.findOne({ email }).then((user) => {
//     if (!user) {
//         return Promise.reject();
//     }
//   });
// };


/*Routing */

app.get('/', (req, res) => {
  res.send(`Home Page!`);
  // res.send(`Available Routes are: `)
});

//Admin Routes
app.post('/users/register', authenticateAdmin, register);
app.get('/users', authenticateAdmin, getAllUsers);
app.get('/users/:id', authenticateAdmin, getUser);
app.patch('/users/:id', authenticateAdmin, updateUser);
app.delete('users/:id', authenticateAdmin, deleteUser);

// //User Routes
app.post('/gen-password/:link/:token', passwordGenerator)
app.patch('/:id', authenticateUser, updateInfo);

app.get('/my-notes', authenticateUser, getNotes);
// app.post('/my-notes/:id', authenticateUser, createNotes)
// app.patch('/my-notes/:id', authenticateUser, updateNotes)
// app.delete('/my-notes/:id', authenticateUser, deleteNotes)

//Login Route
// var userAttempts = 0;
app.post('/users/login', (req, res) => {

  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    return user.generateLoginToken().then((token) => {
      res.header('x-login-auth', token).json({
        _id: user.id,
        email: user.email,
        msg: "Login Successful!\nTake your token from response-header. Use it as header with all your request for authorization "
      })
    })
  }).catch((e) => {
    res.status(400).send();
  });

});

//Logout user
app.delete('/users/logout', authenticateUser, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send(200).send();
  }, () => {
    res.status(400).send();
  });
});

module.exports = { app, router };