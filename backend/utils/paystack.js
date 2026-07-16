// utils/paystack.js — talks to Paystack's API to verify a payment actually
// succeeded. We NEVER trust the frontend's "payment successful" callback
// alone — that popup result can be faked. This server-to-server check with
// our secret key is what actually confirms the money moved.
//
// Docs: https://paystack.com/docs/payments/verify-payments/

async function verifyPaystackTransaction(reference) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not set in .env — online payment cannot be verified.');
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Could not verify this transaction with Paystack.');
  }

  return data.data; // contains { status: 'success', amount, reference, ... }
}

module.exports = { verifyPaystackTransaction };
