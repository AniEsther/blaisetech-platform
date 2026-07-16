// models/Service.js — services Blaisetech offers (Services page, bookings, quotations).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'services',
  timestamps: true,
});

module.exports = Service;
