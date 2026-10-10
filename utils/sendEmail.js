'use strict';

const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP / Gmail credentials if available,
 * or gracefully log the link to the console for development.
 */
async function sendEmail({ to, subject, html, text }) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"QuickCart Security" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } else {
    console.log(`⚠️  No EMAIL_USER/EMAIL_PASS configured in .env.`);
    console.log(`📧 [Simulated Email to ${to}] Subject: "${subject}"`);
    return { sent: false, simulated: true };
  }
}

module.exports = sendEmail;
