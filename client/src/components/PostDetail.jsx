import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    FaHeart, 
    FaRegHeart, 
    FaRegComment, 
    FaRegClock, 
    FaTrashAlt, 
    FaTimes 
} from 'react-icons/fa';
import '../styles/PostDetail.css';

const PostDetail = ({ postId, onClose }) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [reactionId, setReactionId] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchData = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [postRes, commentRes, reactionRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/posts/${postId}`),
                axios.get(`http://localhost:5000/api/comments/${postId}`),
                axios.get(`http://localhost:5000/api/reactions/${postId}`)
            ]);

            setPost(postRes.data);
            setComments(commentRes.data);
            setLikeCount(reactionRes.data.summary?.like || 0);

            // Tìm reaction của chính mình
            const myReaction = reactionRes.data.reactions?.find(r => 
                r.userId?._id === user?._id || r.userId === user?._id
            );
            
            if (myReaction) {
                setIsLiked(true);
                setReactionId(myReaction._id);
            } else {
                setIsLiked(false);
                setReactionId(null);
            }
        } catch (error) {
            console.error('Error loading post detail:', error);
        } finally {
            setLoading(false);
        }
    }, [postId, user?._id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleLike = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login to like');

        try {
            if (!isLiked) {
                const response = await axios.post(
                    'http://localhost:5000/api/reactions',
                    { targetId: postId, targetType: 'post', type: 'like' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
                setReactionId(response.data._id);
            } else {
                await axios.delete(
                    `http://localhost:5000/api/reactions/${reactionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsLiked(false);
                setLikeCount(prev => prev - 1);
                setReactionId(null);
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/comments',
                { postId, text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            alert('Failed to add comment');
        } finally {
            setActionLoading(false);
        }
    };
    const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Cập nhật lại danh sách bình luận trên giao diện sau khi xóa thành công
        setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
        console.error("Delete comment error:", error);
        alert("Could not delete comment.");
    }
};

    // QUAN TRỌNG: Kiểm tra loading và post tồn tại trước khi render nội dung chi tiết
    if (loading) return <div className="modal-loader"><div className="spinner"></div></div>;
    if (!post) return null;

    return (
        <div className="post-detail-overlay" onClick={onClose}>
            <div className="post-detail-container" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}><FaTimes /></button>

                <div className="modal-body">
                    <div className="post-main-content">
                        <div className="post-header">
                            <div className="user-avatar-placeholder">
                                {post.userId?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                                <h4>{post.userId?.username || 'Unknown User'}</h4>
                                <span className="post-time">
                                    <FaRegClock /> {new Date(post.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="post-text">
                            <p>{post.content}</p>
                        </div>

                        <div className="instagram-action-bar">
                            <div className="action-buttons">
                                <button 
                                    className={`like-btn ${isLiked ? 'liked' : ''}`} 
                                    onClick={toggleLike}
                                >
                                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                                </button>
                                <span className="like-counter">{likeCount} likes</span>
                            </div>
                        </div>
                    </div>

                    <div className="post-comments-side">
                        <div className="comments-header">
                            <FaRegComment /> <span>Comments ({comments.length})</span>
                        </div>

                        <div className="comments-scroller">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment._id} className="comment-bubble">
                                        <div className="comment-info">
                                            <strong>{comment.userId?.username}</strong>
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p>{comment.text}</p>
                                        {/* Kiểm tra: Nếu là chủ CMT (comment.userId) HOẶC chủ POST (post.userId) */}
                                            {(comment.userId?._id === user?._id || post?.userId?._id === user?._id) && (
                                            <button 
                                            className="delete-comment" 
                                            title="Delete"
                                            onClick={() => handleDeleteComment(comment._id)}
                                            >
                                            <FaTrashAlt />
                                            </button>
                                            )}
                                    </div>
                                ))
                            ) : (
                                <p className="no-comments">No comments yet.</p>
                            )}
                        </div>

                        <form className="comment-input-area" onSubmit={handleAddComment}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                            />
                            <button type="submit" disabled={actionLoading || !newComment.trim()}>
                                {actionLoading ? '...' : 'Post'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;