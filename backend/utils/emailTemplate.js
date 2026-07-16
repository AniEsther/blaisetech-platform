// utils/emailTemplate.js — builds the actual HTML for notification emails,
// styled to match the site (burgundy / charcoal / white).
//
// Email clients (Gmail, Outlook, Apple Mail, etc.) don't support modern CSS
// the way browsers do — no flexbox, no external stylesheets, and some
// still don't support <style> blocks reliably. So this deliberately uses
// an old-school approach: a single centered <table>, and every style
// written inline on each element. This looks plain in code but is what
// actually renders consistently across inboxes.
//
// WANT TO CUSTOMIZE THE LOOK? Everything you'd want to change lives here:
//   - COLORS below (swap any hex code)
//   - COMPANY_NAME / COMPANY_ADDRESS / COMPANY_PHONE for the footer
//   - The wordmark text in the header row
//   - Wrap another <tr> block in between if you want to add a logo image
//     (use an absolute URL to a hosted image — inline/attached images are
//     unreliable across email clients)

const COLORS = {
  primaryDark: '#4a0a17',
  primary: '#6d0f22',
  accent: '#8c1a33',
  charcoal: '#1c1c1e',
  grey: '#5c5c5e',
  greyLight: '#f2f1f0',
  border: '#d9d6d4',
  white: '#ffffff',
};

const COMPANY_NAME = 'Blaisetech Global Resources';
const COMPANY_ADDRESS = '100 Amechi Aoad, Topland, Amechi, Enugu State, Nigeria';
const COMPANY_PHONE = '0902-192-4553';

// heading: short bold line at the top of the card (e.g. "New Service Booking")
// message: the body text — plain text, newlines become line breaks
// ctaLabel / ctaUrl: optional button, e.g. "Open Admin Dashboard" -> your site's /admin
function buildNotificationEmail({ heading, message, ctaLabel, ctaUrl }) {
  const messageHtml = String(message)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px; font-size:15px; line-height:1.6; color:${COLORS.charcoal};">${line}</p>`)
    .join('');

  const button = ctaLabel && ctaUrl ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;">
      <tr>
        <td style="border-radius:6px; background:${COLORS.primary};">
          <a href="${ctaUrl}" target="_blank"
             style="display:inline-block; padding:12px 26px; font-size:14px; font-weight:bold;
                    color:${COLORS.white}; text-decoration:none; border-radius:6px;">
            ${ctaLabel}
          </a>
        </td>
      </tr>
    </table>` : '';

  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:${COLORS.greyLight}; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.greyLight}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:${COLORS.white}; border-radius:10px; overflow:hidden; border:1px solid ${COLORS.border};">

            <!-- Header -->
            <tr>
              <td style="background:${COLORS.primaryDark}; padding:22px 28px;">
                <span style="font-size:18px; font-weight:bold; color:${COLORS.white};">
                  Blaise<span style="color:#e59aa8;">tech</span> Global Resources
                </span>
              </td>
            </tr>

            <!-- Accent bar -->
            <tr><td style="height:4px; background:${COLORS.accent};"></td></tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 28px 8px;">
                <p style="margin:0 0 6px; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:${COLORS.primary};">
                  Platform Notification
                </p>
                <h1 style="margin:0 0 18px; font-size:21px; color:${COLORS.charcoal};">${heading}</h1>
                ${messageHtml}
                ${button}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 28px; background:${COLORS.greyLight}; border-top:1px solid ${COLORS.border};">
                <p style="margin:0 0 4px; font-size:12px; color:${COLORS.grey};">${COMPANY_NAME}</p>
                <p style="margin:0 0 4px; font-size:12px; color:${COLORS.grey};">${COMPANY_ADDRESS}</p>
                <p style="margin:0; font-size:12px; color:${COLORS.grey};">${COMPANY_PHONE}</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = { buildNotificationEmail };