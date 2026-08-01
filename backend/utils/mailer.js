const nodemailer = require('nodemailer');

// Reads SMTP config from env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
});

async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || 'no-reply@theiptv.local';
  return transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendMail };
