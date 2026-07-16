const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', ctrl.getAllReviews);
router.post('/', protect, restrictTo('customer'), ctrl.createReview);
router.delete('/:id', protect, restrictTo('admin'), ctrl.deleteReview);

module.exports = router;
