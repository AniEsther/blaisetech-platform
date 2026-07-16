// controllers/messageController.js — general contact messages / quick reviews
// left from the public Contact page. No login required.
const { ContactMessage } = require('../models');
const { notifyAdmin } = require('../utils/email');

// POST /api/messages  (public)
async function createMessage(req, res, next) {
  try {
    const { name, email, message, rating } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required.' });
    }
    if (rating !== undefined && rating !== '' && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    const entry = await ContactMessage.create({ name, email, message, rating: rating || null });

    notifyAdmin('New Contact Message', `${name}${email ? ` (${email})` : ''} sent a message: "${message}"`);

    res.status(201).json({ message: 'Thank you — your message has been received.', entry });
  } catch (err) { next(err); }
}

// GET /api/messages  (admin)
async function getAllMessages(req, res, next) {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (err) { next(err); }
}

module.exports = { createMessage, getAllMessages };
