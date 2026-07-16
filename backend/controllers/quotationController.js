// controllers/quotationController.js — admin-managed cost estimation module.
// Customers no longer request quotations directly; one is opened automatically
// when they book a service (see bookingController). The admin fills in the
// amount, can attach a document, and sending it to "approved" automatically
// generates an invoice for the customer.
const { Quotation, Service, User, Invoice } = require('../models');

// GET /api/quotations/my  (customer)
async function getMyQuotations(req, res, next) {
  try {
    const quotations = await Quotation.findAll({
      where: { customerId: req.user.id },
      include: [{ model: Service }],
      order: [['createdAt', 'DESC']],
    });
    res.json(quotations);
  } catch (err) { next(err); }
}

// GET /api/quotations  (admin)
async function getAllQuotations(req, res, next) {
  try {
    const quotations = await Quotation.findAll({
      include: [{ model: Service }, { model: User, attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(quotations);
  } catch (err) { next(err); }
}

// PATCH /api/quotations/:id  (admin — set final amount, attach a document, change status)
// Accepts multipart/form-data so a document can optionally be attached.
async function updateQuotation(req, res, next) {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });

    const { amount, status, details } = req.body;
    if (amount !== undefined) quotation.amount = amount;
    if (details !== undefined) quotation.details = details;
    if (req.file) quotation.documentUrl = `/uploads/${req.file.filename}`;

    const wasApproved = quotation.status === 'approved';
    if (status) quotation.status = status;
    await quotation.save();

    // Auto-generate the invoice the moment a quotation becomes "approved" —
    // the customer sees it show up in their dashboard without any extra admin step.
    if (!wasApproved && quotation.status === 'approved') {
      const existingInvoice = await Invoice.findOne({ where: { quotationId: quotation.id } });
      if (!existingInvoice) {
        await Invoice.create({
          customerId: quotation.customerId,
          quotationId: quotation.id,
          totalAmount: quotation.amount,
          status: 'unpaid',
        });
      }
    } else if (wasApproved && quotation.status === 'approved' && amount !== undefined) {
      // Admin revised and resent an already-approved quotation — keep the
      // linked invoice's total in sync, as long as it hasn't been paid yet.
      const existingInvoice = await Invoice.findOne({ where: { quotationId: quotation.id } });
      if (existingInvoice && existingInvoice.status === 'unpaid') {
        existingInvoice.totalAmount = quotation.amount;
        await existingInvoice.save();
      }
    }

    res.json(quotation);
  } catch (err) { next(err); }
}

module.exports = { getMyQuotations, getAllQuotations, updateQuotation };
