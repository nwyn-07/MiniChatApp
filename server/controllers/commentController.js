const Comment = require('../schemas/commentSchema');
const Post = require('../schemas/postSchema');

const createComment = async (req, res) => {
    const userId = req.user._id;
    const { postId, text } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const newComment = new Comment({
            postId,
            userId,
            text,
        });

        const response = await newComment.save();
        const populatedComment = await response.populate('userId', 'username email');
        res.status(201).json(populatedComment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getCommentsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await Comment.find({ postId, isDeleted: { $ne: true } }).populate('userId', 'username email').sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateComment = async (req, res) => {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { text } = req.body;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only edit your own comments' });
        }

        if (text) comment.text = text;
        const response = await comment.save();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteComment = async (req, res) => {
    const userId = req.user._id; // ID người đang thực hiện lệnh xóa
    const { commentId } = req.params;

    try {
        // 1. Tìm bình luận và thông tin bài viết liên quan
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const post = await Post.findById(comment.postId);

        // 2. Kiểm tra quyền xóa:
        // Quyền 1: Là người viết bình luận đó (comment.userId)
        // Quyền 2: Là người sở hữu bài viết chứa bình luận đó (post.userId)
        const isCommentOwner = comment.userId.toString() === userId.toString();
        const isPostOwner = post && post.userId.toString() === userId.toString();

        if (!isCommentOwner && !isPostOwner) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        // 3. Thực hiện xóa mềm
        comment.isDeleted = true;
        await comment.save();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
};
