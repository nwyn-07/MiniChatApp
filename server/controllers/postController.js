const mongoose = require('mongoose');
const Post = require('../schemas/postSchema');
const Notification = require('../schemas/notificationSchema');

const createPost = async (req, res) => {
    const userId = req.user._id;
    const { content } = req.body;

    try {
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        let imageUrl = null;
        // Kiểm tra nếu có file được gửi lên từ Multer (req.file)
        if (req.file) {
            // Đường dẫn này sẽ khớp với cấu hình express.static trong server.js của bạn
            imageUrl = `/uploads/posts/${req.file.filename}`;
        }

        const newPost = new Post({
            userId,
            content,
            // Nếu có ảnh thì lưu imageUrl, nếu không thì để null hoặc mảng trống tùy Schema của bạn
            // Ở đây mình giả định bạn lưu 1 ảnh duy nhất cho đơn giản
            image: imageUrl, 
        });

        const savedPost = await newPost.save();
        // Populate để trả về luôn thông tin user, giúp frontend render ngay không cần reload
        const response = await savedPost.populate('userId', 'username email');
        
        res.status(201).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createPostWithTransaction = async (req, res) => {
    const userId = req.user._id;
    const { content, images } = req.body;
    const session = await mongoose.startSession();

    try {
        if (!content) {
            await session.endSession();
            return res.status(400).json({ message: 'Content is required' });
        }

        session.startTransaction();

        const newPost = new Post({
            userId,
            content,
            images: images || [],
        });

        const savedPost = await newPost.save({ session });

        const notification = new Notification({
            userId,
            type: 'post',
            message: 'Your post was created successfully',
            relatedId: savedPost._id,
            isRead: false,
        });

        await notification.save({ session });

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({ post: savedPost, notification });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username email').sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPostById = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId).populate('userId', 'username email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updatePost = async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;
    const { content, images } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only edit your own posts' });
        }

        if (content) post.content = content;
        if (images) post.images = images;

        const response = await post.save();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deletePost = async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserPosts = async (req, res) => {
    const { userId } = req.params;

    try {
        const posts = await Post.find({ userId }).populate('userId', 'username email').sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createPost,
    createPostWithTransaction,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    getUserPosts,
};
