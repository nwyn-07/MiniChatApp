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

        let imageUrls = [];
        // Kiểm tra nếu có mảng file được gửi lên từ Multer (req.files)
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }

        const newPost = new Post({
            userId,
            content,
            images: imageUrls, 
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
        const posts = await Post.find({ isDeleted: { $ne: true } }).populate('userId', 'username email').sort({ createdAt: -1 });
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
        if (!post || post.isDeleted) {
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
    const { content, existingImages } = req.body; // existingImages: mảng URL ảnh cũ muốn giữ lại

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only edit your own posts' });
        }

        if (content) post.content = content;

        // Xử lý hình ảnh
        let updatedImages = [];
        
        // 1. Giữ lại các ảnh cũ được gửi từ Frontend (nếu có)
        if (existingImages) {
            // Nếu chỉ gửi 1 string thay vì array (do Multer/FormData), chuyển thành array
            updatedImages = Array.isArray(existingImages) ? existingImages : [existingImages];
        }

        // 2. Thêm các ảnh mới vừa upload (nếu có)
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            updatedImages = [...updatedImages, ...newImageUrls];
        }

        // Cập nhật mảng images
        post.images = updatedImages;

        const savedPost = await post.save();
        const populatedPost = await savedPost.populate('userId', 'username email');
        res.status(200).json(populatedPost);
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

        post.isDeleted = true;
        await post.save();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserPosts = async (req, res) => {
    const { userId } = req.params;

    try {
        const posts = await Post.find({ userId, isDeleted: { $ne: true } }).populate('userId', 'username email').sort({ createdAt: -1 });
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
