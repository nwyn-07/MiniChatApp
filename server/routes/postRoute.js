const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const { uploadImage } = require('../utils/upload'); // Đảm bảo đường dẫn này đúng với file multer bạn gửi
const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    getUserPosts,
} = require('../controllers/postController');
router.post('/', checkLogin, uploadImage.single('postImage'), createPost);

router.get('/', getPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:postId', getPostById);
router.patch('/:postId', checkLogin, updatePost);
router.delete('/:postId', checkLogin, deletePost);

module.exports = router;