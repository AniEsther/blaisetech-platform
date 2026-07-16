// models/Application.js — a candidate's application to a Job listing.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  cvUrl: { type: DataTypes.STRING, allowNull: false },
  coverLetter: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('submitted', 'reviewed', 'shortlisted', 'rejected'),
    defaultValue: 'submitted',
  },
}, {
  tableName: 'applications',
  timestamps: true,
});

module.exports = Application;
