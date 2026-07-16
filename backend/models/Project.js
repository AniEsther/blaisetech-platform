// models/Project.js — a completed job shown in the public Portfolio page.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  clientName: { type: DataTypes.STRING, allowNull: true },
  completedDate: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: 'projects',
  timestamps: true,
});

module.exports = Project;
