const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, restrictTo('customer'), ctrl.createOrder);
router.get('/my', protect, restrictTo('customer'), ctrl.getMyOrders);
router.get('/', protect, restrictTo('admin'), ctrl.getAllOrders);
router.patch('/:id/status', protect, restrictTo('admin'), ctrl.updateOrderStatus);
router.post('/:id/verify-payment', protect, restrictTo('customer'), ctrl.verifyOnlinePayment);
router.patch('/:id/submit-receipt', protect, restrictTo('customer'), upload.single('receipt'), ctrl.submitOrderReceipt);
router.patch('/:id/confirm-payment', protect, restrictTo('admin'), ctrl.confirmOrderPayment);

module.exports = router;
