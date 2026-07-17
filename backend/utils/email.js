// utils/email.js — two kinds of emails go out through here:
//   1) notifyAdmin(...)  — tells the admin a customer did something
//   2) sendMail(...)     — sends an email directly TO a specific person,
//      e.g. a password reset link to the customer who asked for one, or
//      an account setup link to a newly-invited technician.
//
// Uses Nodemailer with plain SMTP so it works with almost any provider —
// Gmail (with an app password), SendGrid, Mailgun, your hosting provider's
// SMTP, etc. Fill in the SMTP_* variables in backend/.env to enable it.
//
// IMPORTANT: neither function ever throws or blocks the request that
// triggered it — if email isn't configured yet, or sending fails, it just
// logs to the console. A booking/order/payment/reset request should never
// fail because a notification email couldn't go out.
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

// Returns true if SMTP is actually configured — controllers use this to
// decide whether to include a "devResetToken"/"devInviteToken" fallback in
// their API response (only needed when there's no real email going out).
function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Sends an email directly to one recipient — password resets, technician
// invites, anything addressed to a specific person rather than the admin.
async function sendMail({ to, subject, heading, message, ctaLabel, ctaUrl }) {
  const t = getTransporter();

  if (!t) {
    console.log(`[email skipped — SMTP not configured] to ${to} — ${subject}: ${message}`);
    return false;
  }

  const html = buildNotificationEmail({ heading: heading || subject, message, ctaLabel, ctaUrl });

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Blaisetech Global Resources — ${subject}`,
      text: `${message}${ctaUrl ? `\n\n${ctaLabel || 'Open link'}: ${ctaUrl}` : ''}`,
      html,
    });
    return true;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return false;
  }
}

// Fire-and-forget: sends a styled email to the admin's notification address.
async function notifyAdmin(subject, message) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.log(`[admin notification skipped — ADMIN_NOTIFICATION_EMAIL not set] ${subject}: ${message}`);
    return;
  }
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`;
  await sendMail({
    to: adminEmail,
    subject,
    message,
    ctaLabel: 'Open Admin Dashboard',
    ctaUrl: dashboardUrl,
  });
}

module.exports = { notifyAdmin, sendMail, isEmailConfigured };