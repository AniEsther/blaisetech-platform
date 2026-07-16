// controllers/serviceController.js — public list of services + admin management.
const { Service } = require('../models');

async function getAllServices(req, res, next) {
  try {
    const services = await Service.findAll({ order: [['category', 'ASC']] });
    res.json(services);
  } catch (err) { next(err); }
}

async function getServiceById(req, res, next) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    res.json(service);
  } catch (err) { next(err); }
}

// admin only
async function createService(req, res, next) {
  try {
    const { name, description, basePrice, category } = req.body;
    if (!name) return res.status(400).json({ message: 'Service name is required.' });
    const service = await Service.create({ name, description, basePrice, category });
    res.status(201).json(service);
  } catch (err) { next(err); }
}

// admin only
async function updateService(req, res, next) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    await service.update(req.body);
    res.json(service);
  } catch (err) { next(err); }
}

// admin only
async function deleteService(req, res, next) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    await service.destroy();
    res.json({ message: 'Service deleted.' });
  } catch (err) { next(err); }
}

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
