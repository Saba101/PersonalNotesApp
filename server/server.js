require('./../db');
require("dotenv").config();
// require('./adminCredentials.js')

const express = require('express');
const _ = require('lodash');

// const { authenticateAdmin } = require('./middlewares/authenticateAdmin');
const { register, passwordGenerator } = require('../controllers/admin-controllers/registration.js');
const { getAllUsers, getUser } = require('../controllers/admin-controllers/get_users');
const { updateUser } = require('../controllers/admin-controllers/update_user.js');
const { deleteUser } = require('../controllers/admin-controllers/delete_user.js');

const { getNotes } = require('../controllers/note-controllers/get_notes.js');
const { createNotes } = require('../controllers/note-controllers/create_notes.js');
const { updateNotes } = require('../controllers/note-controllers/update_notes.js');
const { deleteNotes } = require('../controllers/note-controllers/delete_notes.js');

const { updateInfo } = require('../controllers/user-controllers/updateInfo.js')

const { User } = require('../models/users');
const { Note } = require('../models/notes');
const { ObjectID } = require('mongodb');


const app = express();
app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is up and running on port ` + process.env.PORT + '...');
});

//Middleware functions
//(1)
var authenticateAdmin = (req, res, next) => {
  var token = req.header('x-auth');
  if (!token) {
    console.log("ERRR...If you are admin.. Add your token in header!");
    res.status(400).send("header: token not found!");
  }
  else {
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
  }
};

//(2)
var authenticateUser = (req, res, next) => {

  var token = req.header('x-login-auth');
  if (!token) {
    console.log("ERRR... Add your login-token in header!");
    res.status(400).send("header: login-token not found!");
  }
  else {
    User.findByToken(token).then((user) => {
      if (!user) {
        res.status(400).json({
          error: "User not found!"
        });
        return Promise.reject();
      }

      // console.log("user found!", token);
      req.user = user;
      req.token = token;
      next();

    }).catch((e) => {
      res.status(401).send();
    });
  }

};

/*Routing*/

app.get('/', (req, res) => {
  res.send(`Home Page!`);
});

//Admin Routes
app.post('/users/register', authenticateAdmin, register);
app.get('/users', authenticateAdmin, getAllUsers);
app.get('/users/:id', authenticateAdmin, getUser);
app.patch('/users/:id', authenticateAdmin, updateUser);
app.delete('/users/:id', authenticateAdmin, deleteUser);

// //User Routes
app.get('/gen-password/:link/:token', passwordGenerator)
app.patch('/:id', authenticateUser, updateInfo);
app.get('/my-notes', authenticateUser, getNotes);
// app.post('/my-notes', authenticateUser, createNotes);
// app.patch('/my-notes/:id', authenticateUser, updateNotes);
// app.delete('/my-notes/:id', authenticateUser, deleteNotes);


app.post('/my-notes', authenticateUser, (req, res) => {
  var note = new Note(req.body);
  note._creator = req.user._id;
  console.log(note);

  note.save().then((doc) => {
    res.status(200).send(doc);
    console.log('Note saved!\n', doc);

  }, (err) => {
    res.status(400).send(err);
    console.log('Unable to save note: ', err);
  });
});

app.patch('/my-notes/:id', authenticateUser, (req, res) => {
  var id = req.params.id;  //note's id
  var body = _.pick(req.body, ['text', 'done']);

  if (!ObjectID.isValid(id)) {
    console.log('Invalid Note Id');
    return res.status(400).send(err);
  }

  Note.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  },
    {
      $set: body
    },
    {
      new: true
    })
    .then((note) => {
      if (!note) {
        res.status(404).send();
        return console.log('note not found');
      }
      console.log("updated", note);
      res.status(200).json({
        message: "Updation Successful!",
        note
      });
    })
    .catch((e) => {
      res.status(400).send("error updating user!");
    });
});

app.delete('/my-notes/:id', authenticateUser, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    console.log('Id enterd is invalid');
    return res.status(400).send(err);
  }

  Note.findOneAndRemove({
    _id: id,
    _creator: req.user._id

  }).then((note) => {
    if (!note) {
      res.status(404).send();
      return console.log('note not found');
    }
    console.log("deleted", note);
    res.status(200).json({
      message: "Deletion Successful!",
      note
    });

  })
    .catch((e) => {
      res.status(400).send("error deleting note!");
    });
});


//Login Route
app.post('/login', (req, res) => {

  var body = _.pick(req.body, ['email', 'password']);
  console.log("Logging in user: ", body);

  User.findByCredentials(body.email, body.password).then((user) => {
    // console.log(user);
    user.generateLoginToken().then((token) => {
      res.header('x-login-auth', token).json({
        msg: `Login Successful! 
        ***Take your token from response-header***. Use it as header with all your request for authorization `,
        user
      })
    })
  }).catch((e) => {
    res.status(400).send();
  });

});

//Logout user
//send x-login-auth token in header
app.delete('/logout', authenticateUser, (req, res) => {
  console.log("hello", req.user);
  req.user.removeToken(req.token).then(() => {
    res.status(200).send("Logged Out successfully!");
  }, () => {
    res.status(400).send("Couldn't Log Out!");
  });
});

module.exports = { app };