// utils/email.js — sends notification emails to the admin whenever a
// customer does something that needs attention (new booking, new order,
// a payment receipt was uploaded, etc).
//
// Uses Nodemailer with plain SMTP so it works with almost any provider —
// Gmail (with an app password), SendGrid, Mailgun, your hosting provider's
// SMTP, etc. Fill in the SMTP_* variables in backend/.env to enable it.
//
// IMPORTANT: this NEVER throws or blocks the request that triggered it —
// if email isn't configured yet, or sending fails, it just logs to the
// console. A booking/order/payment should never fail because a
// notification email couldn't go out.
//
// WANT TO CHANGE HOW THE EMAIL LOOKS? Edit utils/emailTemplate.js — colors,
// company info, and the button all live there. This file only handles
// sending.

const nodemailer = require('nodemailer');
const { buildNotificationEmail } = require('./emailTemplate');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // not configured yet
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Fire-and-forget: sends a styled email to the admin's notification address.
// Never awaited by callers in a way that would block their response.
async function notifyAdmin(subject, message) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const t = getTransporter();

  if (!adminEmail || !t) {
    // Not configured yet — log instead of failing, so development and
    // testing still works without an email account set up.
    console.log(`[email notification skipped — SMTP not configured] ${subject}: ${message}`);
    return;
  }

  // FRONTEND_URL lets the email include a working "Open Admin Dashboard"
  // button. Set it in .env once you know your real site URL (defaults to
  // the local dev address so the button still works while testing).
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`;

  const html = buildNotificationEmail({
    heading: subject,
    message,
    ctaLabel: 'Open Admin Dashboard',
    ctaUrl: dashboardUrl,
  });

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject: `Blaisetech Platform — ${subject}`,
      text: message, // plain-text fallback for clients that don't render HTML
      html,
    });
  } catch (err) {
    console.error('Failed to send admin notification email:', err.message);
  }
}

module.exports = { notifyAdmin };