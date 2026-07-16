const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/my', protect, restrictTo('customer'), ctrl.getMyInvoices);
router.get('/', protect, restrictTo('admin'), ctrl.getAllInvoices);
router.patch('/:id/submit-payment', protect, restrictTo('customer'), upload.single('receipt'), ctrl.submitPayment);
router.patch('/:id', protect, restrictTo('admin'), ctrl.updateInvoice);

module.exports = router;
