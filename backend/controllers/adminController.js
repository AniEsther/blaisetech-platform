// controllers/adminController.js — dashboard summary + admin-only account management.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Booking, Quotation, User, EmergencyRequest, Invoice, Order } = require('../models');

// GET /api/admin/summary
async function getDashboardSummary(req, res, next) {
  try {
    const [totalCustomers, pendingBookings, pendingEmergencies, pendingQuotations, revenueResult, pendingOrders, pendingPayments, pendingOrderPayments] =
      await Promise.all([
        User.count({ where: { role: 'customer' } }),
        Booking.count({ where: { status: 'pending' } }),
        EmergencyRequest.count({ where: { status: 'pending' } }),
        Quotation.count({ where: { status: 'draft' } }),
        Invoice.sum('amountPaid'),
        Order.count({ where: { status: 'pending' } }),
        Invoice.count({ where: { status: 'pending_confirmation' } }),
        Order.count({ where: { paymentStatus: 'pending_confirmation' } }),
      ]);

    res.json({
      totalCustomers,
      pendingBookings,
      pendingEmergencies,
      pendingQuotations,
      pendingOrders,
      pendingPayments: pendingPayments + pendingOrderPayments,
      totalRevenue: revenueResult || 0,
    });
  } catch (err) { next(err); }
}

// POST /api/admin/technicians — admin invites a technician by email.
// No password is set here — an unusable random password is stored as a
// placeholder, and the technician sets their own password (plus profile
// details like home address) through the invite link.
async function inviteTechnician(req, res, next) {
  try {
    const { fullName, email, phone } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required.' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const technician = await User.create({
      fullName, email, phone,
      password: placeholderPassword,
      role: 'technician',
      accountSetupComplete: false,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days to accept the invite
    });

    res.status(201).json({
      message: 'Technician invited. Share the setup link with them so they can create their own password.',
      technician: { id: technician.id, fullName: technician.fullName, email: technician.email },
      // TODO: once a real email provider is connected, email this link instead
      // of returning it here — see authController.forgotPassword for the same note.
      devInviteToken: rawToken,
    });
  } catch (err) { next(err); }
}

// GET /api/admin/technicians
async function getAllTechnicians(req, res, next) {
  try {
    const technicians = await User.findAll({
      where: { role: 'technician' },
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
    });
    res.json(technicians);
  } catch (err) { next(err); }
}

// PATCH /api/admin/technicians/:id/deactivate
// Revokes a technician's access without deleting their account — this
// keeps their task history and reports intact, but they can no longer
// log in (enforced immediately, not just on their next login attempt —
// see middleware/auth.js). Use this when someone resigns or is let go.
async function deactivateTechnician(req, res, next) {
  try {
    const technician = await User.findOne({ where: { id: req.params.id, role: 'technician' } });
    if (!technician) return res.status(404).json({ message: 'Technician not found.' });
    technician.isActive = false;
    await technician.save();
    res.json({ message: 'Access revoked. This technician can no longer log in.' });
  } catch (err) { next(err); }
}

// PATCH /api/admin/technicians/:id/reactivate
async function reactivateTechnician(req, res, next) {
  try {
    const technician = await User.findOne({ where: { id: req.params.id, role: 'technician' } });
    if (!technician) return res.status(404).json({ message: 'Technician not found.' });
    technician.isActive = true;
    await technician.save();
    res.json({ message: 'Access restored.' });
  } catch (err) { next(err); }
}

// PATCH /api/admin/technicians/:id/resend-invite
// For when a technician never got around to (or lost) their setup link.
// Generates a fresh token — the old link stops working once this runs.
async function resendTechnicianInvite(req, res, next) {
  try {
    const technician = await User.findOne({ where: { id: req.params.id, role: 'technician' } });
    if (!technician) return res.status(404).json({ message: 'Technician not found.' });
    if (technician.accountSetupComplete) {
      return res.status(400).json({ message: 'This technician has already completed account setup.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    technician.resetPasswordToken = hashedToken;
    technician.resetPasswordExpires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await technician.save();

    res.json({
      message: 'A new setup link has been generated — the old one no longer works.',
      devInviteToken: rawToken,
    });
  } catch (err) { next(err); }
}

// PATCH /api/admin/technicians/:id — edit a technician's basic contact
// details (useful for fixing a typo'd email before resending an invite).
async function updateTechnicianProfile(req, res, next) {
  try {
    const technician = await User.findOne({ where: { id: req.params.id, role: 'technician' } });
    if (!technician) return res.status(404).json({ message: 'Technician not found.' });

    const { fullName, email, phone } = req.body;
    if (email && email !== technician.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ message: 'Another account already uses this email.' });
      technician.email = email;
    }
    if (fullName) technician.fullName = fullName;
    if (phone !== undefined) technician.phone = phone;
    await technician.save();

    res.json({ message: 'Technician details updated.' });
  } catch (err) { next(err); }
}

module.exports = {
  getDashboardSummary, inviteTechnician, getAllTechnicians, deactivateTechnician, reactivateTechnician,
  resendTechnicianInvite, updateTechnicianProfile,
};
