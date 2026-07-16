// models/Job.js — a job/vacancy listing posted by admin.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  requirements: { type: DataTypes.TEXT, allowNull: true }, // qualifications/skills needed, shown to applicants
  location: { type: DataTypes.STRING, allowNull: true },
  employmentType: { type: DataTypes.STRING, allowNull: true },
  isOpen: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'jobs',
  timestamps: true,
});

module.exports = Job;
