// models/Invoice.js — generated automatically once a quotation is approved.
// The customer can upload proof of payment; the admin confirms it.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  quotationId: { type: DataTypes.INTEGER, allowNull: false },
  amountPaid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  receiptUrl: { type: DataTypes.STRING, allowNull: true }, // payment receipt the customer uploads
  status: {
    type: DataTypes.ENUM('unpaid', 'pending_confirmation', 'paid'),
    defaultValue: 'unpaid',
  },
}, {
  tableName: 'invoices',
  timestamps: true,
});

module.exports = Invoice;
