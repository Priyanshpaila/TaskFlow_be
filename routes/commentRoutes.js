const express = require('express');
const router = express.Router();
const { addComment, getCommentsForTask } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addComment);
router.get('/:taskId', protect, getCommentsForTask);

module.exports = router;
