const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, restrictTo('customer'), upload.single('image'), ctrl.createBooking);
router.get('/my', protect, restrictTo('customer'), ctrl.getMyBookings);
router.get('/', protect, restrictTo('admin'), ctrl.getAllBookings);
router.patch('/:id/status', protect, restrictTo('admin'), ctrl.updateBookingStatus);

module.exports = router;
