const nodemailer = require('nodemailer');

const sendEmail = (toAddress, subject, emailBody) => {
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_MAIL,
      pass: process.env.GMAIL_PASSWORD
    }
  });

  const mailOptions = {
    to: toAddress,
    from: process.env.GMAIL_MAIL,
    subject: subject,
    html: emailBody
  };

  smtpTransport.sendMail(mailOptions, function (err, info) {
    if (err)
      console.log(err)
    else
      console.log(info);
  });
};

module.exports = {
  sendEmail
}
