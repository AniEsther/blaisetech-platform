// models/Booking.js — a customer's request for a technician to visit.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  faultDescription: { type: DataTypes.TEXT, allowNull: false },
  additionalNotes: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  preferredDate: { type: DataTypes.DATEONLY, allowNull: false },
  preferredTime: {
    type: DataTypes.ENUM('Morning (8am - 12pm)', 'Afternoon (12pm - 4pm)', 'Evening (4pm - 7pm)'),
    allowNull: true,
  },
  urgencyLevel: {
    type: DataTypes.ENUM('normal', 'urgent'),
    defaultValue: 'normal',
  },
  contactPhone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
