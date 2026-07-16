// models/Order.js — a customer's purchase of one or more products.
// "status" tracks fulfillment (pending -> confirmed -> shipped -> delivered).
// "paymentStatus" tracks money separately, since a delivery can be pending
// while payment is already confirmed, or vice versa.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  deliveryAddress: { type: DataTypes.STRING, allowNull: false },
  contactPhone: { type: DataTypes.STRING, allowNull: false },
  preferredDeliveryDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }, // e.g. landmark, gate code, delivery instructions
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },

  // --- payment ---
  paymentMethod: { type: DataTypes.ENUM('online', 'receipt_upload'), allowNull: true },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'pending_confirmation', 'paid'),
    defaultValue: 'unpaid',
  },
  receiptUrl: { type: DataTypes.STRING, allowNull: true }, // used for the receipt_upload path
  paystackReference: { type: DataTypes.STRING, allowNull: true }, // used for the online path
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
