const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', ctrl.getAllServices);
router.get('/:id', ctrl.getServiceById);
router.post('/', protect, restrictTo('admin'), ctrl.createService);
router.put('/:id', protect, restrictTo('admin'), ctrl.updateService);
router.delete('/:id', protect, restrictTo('admin'), ctrl.deleteService);

module.exports = router;
