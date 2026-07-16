// controllers/projectController.js — portfolio of completed projects.
const { Project } = require('../models');

async function getAllProjects(req, res, next) {
  try {
    const projects = await Project.findAll({ order: [['completedDate', 'DESC']] });
    res.json(projects);
  } catch (err) { next(err); }
}

// admin only
async function createProject(req, res, next) {
  try {
    const { title, description, clientName, completedDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required.' });
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const project = await Project.create({ title, description, clientName, completedDate, imageUrl });
    res.status(201).json(project);
  } catch (err) { next(err); }
}

// admin only — edit an existing portfolio entry, optionally replacing its photo
async function updateProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
    await project.update(updates);
    res.json(project);
  } catch (err) { next(err); }
}

// admin only
async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await project.destroy();
    res.json({ message: 'Project removed.' });
  } catch (err) { next(err); }
}

module.exports = { getAllProjects, createProject, updateProject, deleteProject };
