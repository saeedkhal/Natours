const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('waiting in email.js 1');
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER_NAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  console.log('waiting in email.js 2');

  // 2) Define the email options
  const mailOptions = {
    from: 'Jonas Schmedtmann <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  console.log('waiting in email.js 3');

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
  console.log('waiting in email.js 4');
};

module.exports = sendEmail;