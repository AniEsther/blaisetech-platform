const express = require('express');
const router = express.Router();
const {
  register, login, getMe, forgotPassword, resetPassword, checkInviteToken, completeInvite,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/invite/:token', checkInviteToken);
router.post('/complete-invite', completeInvite);

module.exports = router;
