// models/Task.js — a job the admin assigns to a technician (optionally linked
// to a customer's booking), with a status and a written report the
// technician submits when the work is done.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  technicianId: { type: DataTypes.INTEGER, allowNull: false },
  bookingId: { type: DataTypes.INTEGER, allowNull: true }, // optional link to a customer booking
  title: { type: DataTypes.STRING, allowNull: false },
  instructions: { type: DataTypes.TEXT, allowNull: true },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
    defaultValue: 'assigned',
  },
  report: { type: DataTypes.TEXT, allowNull: true }, // technician's write-up after completing the job
}, {
  tableName: 'tasks',
  timestamps: true,
});

module.exports = Task;
