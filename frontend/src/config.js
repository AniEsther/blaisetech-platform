// config.js — small feature flags used across the app.
//
// ONLINE_PAYMENTS_ENABLED: the Paystack integration code is fully built
// (see CustomerDashboard.jsx — payForOrderOnline / payInvoiceOnline), but
// is switched off by default until a real Paystack account is connected
// (see backend/.env's PAYSTACK_SECRET_KEY and frontend/.env's
// VITE_PAYSTACK_PUBLIC_KEY). While this is false, clicking "Pay Online"
// shows a "coming soon" message instead of opening the checkout popup.
// Flip it to true once those keys are set up for real.
export const ONLINE_PAYMENTS_ENABLED = false;
