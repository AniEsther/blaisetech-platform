const express = require('express');
const router = express.Router();
const {
  getDashboardSummary, inviteTechnician, getAllTechnicians, deactivateTechnician, reactivateTechnician,
  resendTechnicianInvite, updateTechnicianProfile,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/summary', protect, restrictTo('admin'), getDashboardSummary);
router.post('/technicians', protect, restrictTo('admin'), inviteTechnician);
router.get('/technicians', protect, restrictTo('admin'), getAllTechnicians);
router.patch('/technicians/:id', protect, restrictTo('admin'), updateTechnicianProfile);
router.patch('/technicians/:id/deactivate', protect, restrictTo('admin'), deactivateTechnician);
router.patch('/technicians/:id/reactivate', protect, restrictTo('admin'), reactivateTechnician);
router.patch('/technicians/:id/resend-invite', protect, restrictTo('admin'), resendTechnicianInvite);

module.exports = router;
