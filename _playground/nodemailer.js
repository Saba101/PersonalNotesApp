const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    // name: "smtp.mailtrap.io",
    host: "gmail.com"
    // port: 2525,
    // auth: {
    //     user: "4f877d8b44d32f",
    //     pass: "dffef385dac432"
    // }
});

let mail = {
    from: '"Node Mailer" <sabaamin2468@gmail.com', // sender address
    to: 'sub2468@hotmail.com', // list of receivers
    subject: "Account Verification Email", // Subject line
    text: "Hello!" // plain text body
    /*
    html: `
    <h2> Password Generation Link <h2>
    <p> This is our safetly protocol to ensure your account is safe with us
        <a href="${process.env.CLIENT_URL}/authentication/generatePas/${token}"> Click here for automatic password generation </a> </p>
    ` */
}

transporter.sendMail(mail, (err, info) => {
    if (err) {
        return console.log("Error in sending mail!\n", err);
    }
    console.log("Email sent: %s", info.messageId);
    res.send("Verification Email Sent. Check your inbox! \n**The link will expire in 15 minutes**");
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
});