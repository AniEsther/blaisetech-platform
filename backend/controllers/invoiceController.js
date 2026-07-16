// controllers/invoiceController.js — invoices are created automatically when a
// quotation is approved (see quotationController). This module handles the
// customer uploading proof of payment, and the admin confirming it.
const { Invoice, Quotation, Service, User } = require('../models');
const { notifyAdmin } = require('../utils/email');

// GET /api/invoices/my  (customer)
async function getMyInvoices(req, res, next) {
  try {
    const invoices = await Invoice.findAll({
      where: { customerId: req.user.id },
      include: [{ model: Quotation, include: [Service] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(invoices);
  } catch (err) { next(err); }
}

// GET /api/invoices  (admin — every invoice, so payments can be reviewed/confirmed)
async function getAllInvoices(req, res, next) {
  try {
    const invoices = await Invoice.findAll({
      include: [{ model: Quotation, include: [Service] }, { model: User, attributes: ['id', 'fullName', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(invoices);
  } catch (err) { next(err); }
}

// PATCH /api/invoices/:id/submit-payment  (customer — upload receipt, mark as paid)
async function submitPayment(req, res, next) {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    if (invoice.customerId !== req.user.id) return res.status(403).json({ message: 'This is not your invoice.' });
    if (!req.file) return res.status(400).json({ message: 'Please attach your payment receipt.' });

    invoice.receiptUrl = `/uploads/${req.file.filename}`;
    invoice.status = 'pending_confirmation';
    await invoice.save();

    notifyAdmin('Payment Receipt Uploaded (Invoice)', `A payment receipt was uploaded for invoice #${invoice.id}, total ₦${Number(invoice.totalAmount).toLocaleString()}. Please review and confirm.`);

    res.json({ message: 'Receipt uploaded. We will confirm your payment shortly.', invoice });
  } catch (err) { next(err); }
}

// PATCH /api/invoices/:id  (admin — confirm payment, adjust amount paid)
async function updateInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    const { amountPaid, status } = req.body;
    if (amountPaid !== undefined) invoice.amountPaid = amountPaid;
    if (status) invoice.status = status;
    await invoice.save();
    res.json(invoice);
  } catch (err) { next(err); }
}

module.exports = { getMyInvoices, getAllInvoices, submitPayment, updateInvoice };
