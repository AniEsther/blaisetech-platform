// models/index.js — links the tables together (relationships) and exports everything
// so controllers only need one import line.

const sequelize = require('../config/db');
const User = require('./User');
const Service = require('./Service');
const Booking = require('./Booking');
const Quotation = require('./Quotation');
const Invoice = require('./Invoice');
const EmergencyRequest = require('./EmergencyRequest');
const Project = require('./Project');
const Review = require('./Review');
const Job = require('./Job');
const Application = require('./Application');
const Task = require('./Task');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const ContactMessage = require('./ContactMessage');

User.hasMany(Booking, { foreignKey: 'customerId' });
Booking.belongsTo(User, { foreignKey: 'customerId' });

Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

User.hasMany(Quotation, { foreignKey: 'customerId' });
Quotation.belongsTo(User, { foreignKey: 'customerId' });

Service.hasMany(Quotation, { foreignKey: 'serviceId' });
Quotation.belongsTo(Service, { foreignKey: 'serviceId' });

Quotation.hasOne(Invoice, { foreignKey: 'quotationId' });
Invoice.belongsTo(Quotation, { foreignKey: 'quotationId' });

User.hasMany(Invoice, { foreignKey: 'customerId' });
Invoice.belongsTo(User, { foreignKey: 'customerId' });

User.hasMany(EmergencyRequest, { foreignKey: 'customerId' });
EmergencyRequest.belongsTo(User, { foreignKey: 'customerId' });

User.hasMany(Review, { foreignKey: 'customerId' });
Review.belongsTo(User, { foreignKey: 'customerId' });

Booking.hasOne(Review, { foreignKey: 'bookingId' });
Review.belongsTo(Booking, { foreignKey: 'bookingId' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// --- Technician tasks ---
User.hasMany(Task, { foreignKey: 'technicianId' });
Task.belongsTo(User, { foreignKey: 'technicianId', as: 'technician' });

Booking.hasMany(Task, { foreignKey: 'bookingId' });
Task.belongsTo(Booking, { foreignKey: 'bookingId' });

// --- Inventory / orders ---
User.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(User, { foreignKey: 'customerId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize, User, Service, Booking, Quotation, Invoice,
  EmergencyRequest, Project, Review, Job, Application,
  Task, Product, Order, OrderItem, ContactMessage,
};
