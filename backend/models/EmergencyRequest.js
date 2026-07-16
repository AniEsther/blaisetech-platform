// models/EmergencyRequest.js — a high-priority fault report needing a rapid response.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmergencyRequest = sequelize.define('EmergencyRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  contactPhone: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'dispatched', 'resolved'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'emergency_requests',
  timestamps: true,
});

module.exports = EmergencyRequest;
