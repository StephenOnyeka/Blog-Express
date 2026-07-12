const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  if (!env.SMTP_HOST) {
    console.warn('SMTP is not configured. Email not sent:', { to, subject });
    return;
  }

  const mailOptions = {
    from: env.FROM_EMAIL || 'no-reply@blog.com',
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendMail,
};
