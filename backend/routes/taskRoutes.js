const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, restrictTo('admin'), ctrl.createTask);
router.get('/', protect, restrictTo('admin'), ctrl.getAllTasks);
router.get('/my', protect, restrictTo('technician'), ctrl.getMyTasks);
router.patch('/:id', protect, restrictTo('admin', 'technician'), ctrl.updateTask);

module.exports = router;
