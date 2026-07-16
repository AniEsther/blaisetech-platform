// controllers/bookingController.js — service booking + appointment scheduling module.
const { Booking, Service, User, Quotation } = require('../models');
const { notifyAdmin } = require('../utils/email');

// POST /api/bookings  (customer)
// As soon as a booking is submitted, we automatically open a draft
// quotation for it — the customer sees "quotation pending," and the admin
// has it ready to fill in without the customer needing to separately ask for one.
async function createBooking(req, res, next) {
  try {
    const { serviceId, faultDescription, additionalNotes, preferredDate, preferredTime, urgencyLevel, contactPhone, address } = req.body;
    if (!serviceId || !faultDescription || !preferredDate || !address || !contactPhone) {
      return res.status(400).json({ message: 'Service, fault description, date, phone number and address are required.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      faultDescription,
      additionalNotes,
      preferredDate,
      preferredTime,
      urgencyLevel: urgencyLevel || 'normal',
      contactPhone,
      address,
      imageUrl,
    });

    await Quotation.create({
      customerId: req.user.id,
      serviceId,
      bookingId: booking.id,
      status: 'draft',
      amount: 0,
    });

    const service = await Service.findByPk(serviceId);
    notifyAdmin(
      'New Service Booking',
      `${req.user.fullName} booked "${service ? service.name : 'a service'}" for ${preferredDate}. Urgency: ${urgencyLevel || 'normal'}. A quotation is waiting for pricing.`
    );

    res.status(201).json({
      message: 'Booking request submitted. Our team will review it and send you a quotation shortly.',
      booking,
    });
  } catch (err) { next(err); }
}

// GET /api/bookings/my  (customer — their own bookings)
async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.findAll({
      where: { customerId: req.user.id },
      include: [{ model: Service }],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) { next(err); }
}

// GET /api/bookings  (admin — all bookings)
async function getAllBookings(req, res, next) {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Service }, { model: User, attributes: ['id', 'fullName', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) { next(err); }
}

// PATCH /api/bookings/:id/status  (admin)
async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
}

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
