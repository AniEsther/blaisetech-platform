// controllers/orderController.js — customers order products; admin fulfills them.
// Payment is handled two ways: pay online through Paystack (verified
// server-side), or upload a payment receipt for admin to confirm manually.
const { Order, OrderItem, Product, User } = require('../models');
const sequelize = require('../config/db');
const { verifyPaystackTransaction } = require('../utils/paystack');
const { notifyAdmin } = require('../utils/email');

const DELIVERY_ESTIMATE = '3–5 business days';

// POST /api/orders  (customer)
// body: { deliveryAddress, contactPhone, preferredDeliveryDate, notes, items: [{ productId, quantity }] }
async function createOrder(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { deliveryAddress, contactPhone, preferredDeliveryDate, notes, items } = req.body;
    if (!deliveryAddress || !contactPhone || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Delivery address, contact phone, and at least one product are required.' });
    }

    let totalAmount = 0;
    const lineItems = [];
    const lineDescriptions = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!quantity || quantity <= 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Quantity must be a positive number.' });
      }

      // LOCK.UPDATE makes this a "SELECT ... FOR UPDATE" — it holds a
      // row-level lock on this product until the transaction commits or
      // rolls back, so a second, simultaneous order for the same product
      // has to wait its turn instead of reading stale stock and both
      // orders succeeding when only one should. This is what was letting
      // stock go negative before.
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) { await t.rollback(); return res.status(404).json({ message: `Product ${item.productId} not found.` }); }
      if (product.stockQuantity < quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Not enough stock for ${product.name}. Only ${product.stockQuantity} left.` });
      }
      totalAmount += Number(product.price) * quantity;
      lineItems.push({ productId: product.id, quantity, unitPrice: product.price });
      lineDescriptions.push(`${product.name} x${quantity}`);

      product.stockQuantity -= quantity;
      await product.save({ transaction: t });
    }

    const order = await Order.create(
      { customerId: req.user.id, deliveryAddress, contactPhone, preferredDeliveryDate: preferredDeliveryDate || null, notes, totalAmount, status: 'pending', paymentStatus: 'unpaid' },
      { transaction: t }
    );

    for (const li of lineItems) {
      await OrderItem.create({ ...li, orderId: order.id }, { transaction: t });
    }

    await t.commit();

    notifyAdmin(
      'New Product Order',
      `${req.user.fullName} placed an order (#${order.id}) for: ${lineDescriptions.join(', ')}. Total: ₦${Number(totalAmount).toLocaleString()}. Delivery to: ${deliveryAddress}.`
    );

    res.status(201).json({
      message: 'Order placed. Please complete payment so we can process it — pay online now or upload a payment receipt from "My Orders."',
      order,
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

// POST /api/orders/:id/verify-payment  (customer — after the Paystack popup succeeds on the frontend)
// This is the step that actually matters: we re-check the payment with
// Paystack directly using our secret key, rather than trusting the
// frontend's callback.
async function verifyOnlinePayment(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.customerId !== req.user.id) return res.status(403).json({ message: 'This is not your order.' });
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order has been cancelled and can no longer be paid for.' });
    }

    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: 'Payment reference is required.' });

    const transaction = await verifyPaystackTransaction(reference);

    const expectedKobo = Math.round(Number(order.totalAmount) * 100);
    if (transaction.status !== 'success') {
      return res.status(400).json({ message: 'Payment was not successful.' });
    }
    if (transaction.amount !== expectedKobo) {
      return res.status(400).json({ message: 'Payment amount does not match the order total.' });
    }

    order.paymentMethod = 'online';
    order.paymentStatus = 'paid';
    order.paystackReference = reference;
    await order.save();

    notifyAdmin('Order Paid Online', `Order #${order.id} was paid online via Paystack. Total: ₦${Number(order.totalAmount).toLocaleString()}.`);

    res.json({
      message: `Payment confirmed! Your order will be delivered within ${DELIVERY_ESTIMATE}.`,
      order,
    });
  } catch (err) { next(err); }
}

// PATCH /api/orders/:id/submit-receipt  (customer — upload a payment receipt instead of paying online)
async function submitOrderReceipt(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.customerId !== req.user.id) return res.status(403).json({ message: 'This is not your order.' });
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order has been cancelled and can no longer be paid for.' });
    }
    if (!req.file) return res.status(400).json({ message: 'Please attach your payment receipt.' });

    order.receiptUrl = `/uploads/${req.file.filename}`;
    order.paymentMethod = 'receipt_upload';
    order.paymentStatus = 'pending_confirmation';
    await order.save();

    notifyAdmin('Payment Receipt Uploaded (Order)', `A payment receipt was uploaded for order #${order.id}, total ₦${Number(order.totalAmount).toLocaleString()}. Please review and confirm.`);

    res.json({
      message: `Receipt received. Once we confirm your payment, your order will be delivered within ${DELIVERY_ESTIMATE}.`,
      order,
    });
  } catch (err) { next(err); }
}

// PATCH /api/orders/:id/confirm-payment  (admin — confirm a manually-uploaded receipt)
async function confirmOrderPayment(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order was cancelled — confirming payment on it isn\'t allowed. If the customer already paid, handle the refund directly.' });
    }
    order.paymentStatus = 'paid';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
}

// GET /api/orders/my  (customer)
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { next(err); }
}

// GET /api/orders  (admin)
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, include: [Product] },
        { model: User, attributes: ['id', 'fullName', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { next(err); }
}

// PATCH /api/orders/:id/status  (admin — fulfillment status: confirmed/shipped/delivered/cancelled/etc.)
// If an order is cancelled and had stock already deducted, restock it —
// otherwise cancelled orders would permanently "lose" that inventory.
async function updateOrderStatus(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) { await t.rollback(); return res.status(404).json({ message: 'Order not found.' }); }

    const wasAlreadyCancelled = order.status === 'cancelled';
    const newStatus = req.body.status;

    if (newStatus === 'cancelled' && !wasAlreadyCancelled) {
      const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (product) {
          product.stockQuantity += item.quantity;
          await product.save({ transaction: t });
        }
      }
    }

    order.status = newStatus;
    await order.save({ transaction: t });
    await t.commit();
    res.json(order);
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

module.exports = {
  createOrder, getMyOrders, getAllOrders, updateOrderStatus,
  verifyOnlinePayment, submitOrderReceipt, confirmOrderPayment,
};
