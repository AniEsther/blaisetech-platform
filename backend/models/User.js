// models/User.js — every person who can log in: customers, admins, technicians.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false }, // stored hashed, never plain text
  role: {
    type: DataTypes.ENUM('customer', 'admin', 'technician'),
    defaultValue: 'customer',
  },
  // --- extra profile details, mainly used for technicians ---
  homeAddress: { type: DataTypes.STRING, allowNull: true },
  specialization: { type: DataTypes.STRING, allowNull: true },

  // --- account setup / password reset (shared by both flows) ---
  resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
  resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
  accountSetupComplete: { type: DataTypes.BOOLEAN, defaultValue: true },

  // --- access control ---
  // Used to revoke a technician's (or any user's) login access without
  // deleting their record — preserves task/booking history while making
  // sure they can no longer log in. See authController.login.
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
