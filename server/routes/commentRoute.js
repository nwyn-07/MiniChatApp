const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
} = require('../controllers/commentController');

router.post('/', checkLogin, createComment);
router.get('/:postId', getCommentsByPost);
router.patch('/:commentId', checkLogin, updateComment);
router.delete('/:commentId', checkLogin, deleteComment);

module.exports = router;
