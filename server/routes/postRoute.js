const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const {
    createPost,
    createPostWithTransaction,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    getUserPosts,
} = require('../controllers/postController');

router.post('/', checkLogin, createPost);
router.post('/transaction', checkLogin, createPostWithTransaction);
router.get('/', getPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:postId', getPostById);
router.patch('/:postId', checkLogin, updatePost);
router.delete('/:postId', checkLogin, deletePost);

module.exports = router;
