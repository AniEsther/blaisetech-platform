const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getOpenJobs);
router.get('/all', protect, restrictTo('admin'), ctrl.getAllJobs);
router.post('/', protect, restrictTo('admin'), ctrl.createJob);
router.patch('/:id', protect, restrictTo('admin'), ctrl.updateJob);
router.post('/:id/apply', upload.single('cv'), ctrl.applyToJob);
router.get('/:id/applications', protect, restrictTo('admin'), ctrl.getApplicationsForJob);
router.patch('/:jobId/applications/:appId', protect, restrictTo('admin'), ctrl.updateApplicationStatus);
router.delete('/:jobId/applications/:appId', protect, restrictTo('admin'), ctrl.deleteApplication);

module.exports = router;
