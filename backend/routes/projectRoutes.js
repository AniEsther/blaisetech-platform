const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getAllProjects);
router.post('/', protect, restrictTo('admin'), upload.single('image'), ctrl.createProject);
router.put('/:id', protect, restrictTo('admin'), upload.single('image'), ctrl.updateProject);
router.delete('/:id', protect, restrictTo('admin'), ctrl.deleteProject);

module.exports = router;
