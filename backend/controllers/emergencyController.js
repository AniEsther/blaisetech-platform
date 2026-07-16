// controllers/emergencyController.js — priority fault reporting / rapid response module.
const { EmergencyRequest } = require('../models');
const { notifyAdmin } = require('../utils/email');

// POST /api/emergency  (customer)
async function createEmergencyRequest(req, res, next) {
  try {
    const { description, location, contactPhone } = req.body;
    if (!description || !location || !contactPhone) {
      return res.status(400).json({ message: 'Description, location and phone number are required.' });
    }
    const request = await EmergencyRequest.create({
      customerId: req.user.id, description, location, contactPhone,
    });

    notifyAdmin(
      'URGENT: Emergency Service Request',
      `An emergency request was submitted. Location: ${location}. Phone: ${contactPhone}. Details: ${description}`
    );

    res.status(201).json({ message: 'Emergency request submitted. Our team has been notified.', request });
  } catch (err) { next(err); }
}

// GET /api/emergency  (admin — all, most urgent/newest first)
async function getAllEmergencyRequests(req, res, next) {
  try {
    const requests = await EmergencyRequest.findAll({ order: [['createdAt', 'DESC']] });
    res.json(requests);
  } catch (err) { next(err); }
}

// PATCH /api/emergency/:id/status  (admin)
async function updateEmergencyStatus(req, res, next) {
  try {
    const request = await EmergencyRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    request.status = req.body.status;
    await request.save();
    res.json(request);
  } catch (err) { next(err); }
}

module.exports = { createEmergencyRequest, getAllEmergencyRequests, updateEmergencyStatus };
