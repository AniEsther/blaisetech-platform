const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quotationController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Note: customers no longer request quotations directly — one is opened
// automatically when they submit a booking (see bookingRoutes/bookingController).
router.get('/my', protect, restrictTo('customer'), ctrl.getMyQuotations);
router.get('/', protect, restrictTo('admin'), ctrl.getAllQuotations);
router.patch('/:id', protect, restrictTo('admin'), upload.single('document'), ctrl.updateQuotation);

module.exports = router;
