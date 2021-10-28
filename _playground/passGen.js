const generator = require('generate-password');
const bcrypt = require('bcryptjs');

var password = generator.generate({
    length: 10,
    numbers: true,
    symbols: false,
    lowercase: true,
    uppercase: true
});

console.log(password);

bcrypt.genSalt(7, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});