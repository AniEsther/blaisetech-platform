const express = require('express');
const router = express.Router();
const { createMessage, getAllMessages } = require('../controllers/messageController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', createMessage);
router.get('/', protect, restrictTo('admin'), getAllMessages);

module.exports = router;
