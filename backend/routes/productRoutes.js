const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getAllProducts);
router.post('/', protect, restrictTo('admin'), upload.single('image'), ctrl.createProduct);
router.put('/:id', protect, restrictTo('admin'), upload.single('image'), ctrl.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), ctrl.deleteProduct);

module.exports = router;
