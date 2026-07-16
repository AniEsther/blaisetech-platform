// models/Product.js — an inventory item customers can order online
// (as opposed to a "Service", which is booked, not purchased).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  category: { type: DataTypes.STRING, allowNull: true }, // e.g. "Cables", "Solar Panels", "Switches"
  imageUrl: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
