const { Resend } = require('resend');
const env = require('../config/env');

const resend = new Resend(env.RESEND_API);

/**
 * Send an email via Resend.
 * @param {Object} params
 * @param {string|string[]} params.to   - Recipient email address(es)
 * @param {string}          params.subject
 * @param {string}          params.html - HTML body
 */
const sendMail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

module.exports = { sendMail };
