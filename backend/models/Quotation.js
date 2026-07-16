// models/Quotation.js — a cost estimate for a customer's requested service,
// created automatically as soon as a booking comes in, then filled in by admin.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Quotation = sequelize.define('Quotation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  bookingId: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.TEXT, allowNull: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  documentUrl: { type: DataTypes.STRING, allowNull: true }, // optional PDF/doc admin attaches (formal quote sheet)
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'quotations',
  timestamps: true,
});

module.exports = Quotation;
