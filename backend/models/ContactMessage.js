// models/ContactMessage.js — a general message or review dropped from the
// Contact page. Doesn't require an account, and can optionally include a
// star rating, so it works as either a quick message or a public review.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: true }, // 1-5, optional
}, {
  tableName: 'contact_messages',
  timestamps: true,
});

module.exports = ContactMessage;
