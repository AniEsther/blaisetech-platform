// controllers/jobController.js — recruitment portal: job listings + applications.
const { Job, Application } = require('../models');
const { notifyAdmin } = require('../utils/email');

// GET /api/jobs  (public — only open jobs)
async function getOpenJobs(req, res, next) {
  try {
    const jobs = await Job.findAll({ where: { isOpen: true }, order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (err) { next(err); }
}

// GET /api/jobs/all  (admin — including closed jobs)
async function getAllJobs(req, res, next) {
  try {
    const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (err) { next(err); }
}

// POST /api/jobs  (admin)
async function createJob(req, res, next) {
  try {
    const { title, description, location, employmentType } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' });
    const job = await Job.create({ title, description, location, employmentType });
    res.status(201).json(job);
  } catch (err) { next(err); }
}

// PATCH /api/jobs/:id  (admin — e.g. close a listing)
async function updateJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    await job.update(req.body);
    res.json(job);
  } catch (err) { next(err); }
}

// POST /api/jobs/:id/apply  (public — candidate applies, uploads CV)
async function applyToJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job || !job.isOpen) return res.status(404).json({ message: 'This job listing is not available.' });

    const { fullName, email, phone, coverLetter } = req.body;
    if (!fullName || !email || !req.file) {
      return res.status(400).json({ message: 'Full name, email and a CV file are required.' });
    }

    const application = await Application.create({
      jobId: job.id, fullName, email, phone, coverLetter,
      cvUrl: `/uploads/${req.file.filename}`,
    });

    notifyAdmin('New Job Application', `${fullName} (${email}) applied for "${job.title}".`);

    res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (err) { next(err); }
}

// GET /api/jobs/:id/applications  (admin)
async function getApplicationsForJob(req, res, next) {
  try {
    const applications = await Application.findAll({
      where: { jobId: req.params.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(applications);
  } catch (err) { next(err); }
}

// PATCH /api/jobs/:jobId/applications/:appId  (admin — e.g. mark shortlisted/rejected)
async function updateApplicationStatus(req, res, next) {
  try {
    const application = await Application.findOne({ where: { id: req.params.appId, jobId: req.params.jobId } });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (err) { next(err); }
}

// DELETE /api/jobs/:jobId/applications/:appId  (admin)
async function deleteApplication(req, res, next) {
  try {
    const application = await Application.findOne({ where: { id: req.params.appId, jobId: req.params.jobId } });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    await application.destroy();
    res.json({ message: 'Application removed.' });
  } catch (err) { next(err); }
}

module.exports = {
  getOpenJobs, getAllJobs, createJob, updateJob, applyToJob, getApplicationsForJob,
  updateApplicationStatus, deleteApplication,
};
