var mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/NotesApp';

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => console.log('database connection established!'))
    .catch((err) => console.log('err! databse connection could not be estblished!'));

module.exports = { mongoose };