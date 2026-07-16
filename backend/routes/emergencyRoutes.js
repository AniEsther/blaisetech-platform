const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/emergencyController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('customer'), ctrl.createEmergencyRequest);
router.get('/', protect, restrictTo('admin'), ctrl.getAllEmergencyRequests);
router.patch('/:id/status', protect, restrictTo('admin'), ctrl.updateEmergencyStatus);

module.exports = router;
