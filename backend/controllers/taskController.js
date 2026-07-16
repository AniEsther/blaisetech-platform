// controllers/taskController.js — admin assigns jobs to technicians; technicians
// update status and submit a written report when done.
const { Task, User, Booking, Service } = require('../models');
const { notifyAdmin } = require('../utils/email');

// POST /api/tasks  (admin — assign a task to a technician)
async function createTask(req, res, next) {
  try {
    const { technicianId, bookingId, title, instructions, dueDate } = req.body;
    if (!technicianId || !title) {
      return res.status(400).json({ message: 'Technician and task title are required.' });
    }

    const technician = await User.findOne({ where: { id: technicianId, role: 'technician' } });
    if (!technician) return res.status(404).json({ message: 'Technician not found.' });

    const task = await Task.create({ technicianId, bookingId: bookingId || null, title, instructions, dueDate });
    res.status(201).json(task);
  } catch (err) { next(err); }
}

// GET /api/tasks  (admin — every task, across all technicians)
async function getAllTasks(req, res, next) {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: User, as: 'technician', attributes: ['id', 'fullName', 'email', 'phone'] },
        { model: Booking, include: [Service] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (err) { next(err); }
}

// GET /api/tasks/my  (technician — their own assigned tasks)
async function getMyTasks(req, res, next) {
  try {
    const tasks = await Task.findAll({
      where: { technicianId: req.user.id },
      include: [{ model: Booking, include: [Service] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (err) { next(err); }
}

// PATCH /api/tasks/:id  (technician — update status and/or submit a report)
async function updateTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // A technician can only update their own tasks; an admin can update any.
    if (req.user.role === 'technician' && task.technicianId !== req.user.id) {
      return res.status(403).json({ message: 'This task is not assigned to you.' });
    }

    const { status, report } = req.body;
    if (status) task.status = status;
    if (report !== undefined) task.report = report;
    await task.save();

    if (status === 'completed' && req.user.role === 'technician') {
      notifyAdmin('Task Report Submitted', `${req.user.fullName} marked "${task.title}" as completed and submitted a report.`);
    }

    res.json(task);
  } catch (err) { next(err); }
}

module.exports = { createTask, getAllTasks, getMyTasks, updateTask };
