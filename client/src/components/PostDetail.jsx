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
                
                <div className="modal-body">
                    {/* KHỐI TRÁI: Dành riêng cho trải nghiệm ngắm HÌNH ẢNH */}
                    <div className="post-main-content-media">
                        {(post.images && post.images.length > 0) ? (
                            <>
                                <div className="post-detail-images-carousel">
                                    {post.images.map((img, idx) => (
                                        <div key={idx} className="post-detail-image-slide">
                                            <img 
                                                src={`http://localhost:5000${img}`} 
                                                alt={`Post detail ${idx}`} 
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {post.images.length > 1 && (
                                    <div className="carousel-indicators">
                                        {post.images.map((_, idx) => (
                                            <span key={idx} className="indicator-dot"></span>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-media-content">
                                <p className="post-text-large">{post.content}</p>
                            </div>
                        )}
                    </div>

                    {/* KHỐI PHẢI: Dành cho Thông tin, Bình luận và Tương tác */}
                    <div className="post-comments-side">
                        <button className="close-modal-btn" onClick={onClose}><FaTimes /></button>

                        <div className="post-header-right">
                            <div className="user-avatar-placeholder">
                                {post.userId?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="header-info">
                                <h4>{post.userId?.username || 'Unknown User'}</h4>
                                <span className="post-time">
                                    <FaRegClock /> {new Date(post.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="comments-scroller">
                            {/* Hiển thị Nội dung bài viết như một comment gốc nếu có ảnh */}
                            {(post.images && post.images.length > 0 && post.content) && (
                                <div className="post-description">
                                    <div className="user-avatar-placeholder small-avatar">
                                        {post.userId?.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="desc-content">
                                        <strong>{post.userId?.username}</strong> {post.content}
                                    </div>
                                </div>
                            )}

                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment._id} className="comment-bubble">
                                        <div className="user-avatar-placeholder small-avatar">
                                            {comment.userId?.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="comment-body">
                                            <p><strong>{comment.userId?.username}</strong> {comment.text}</p>
                                            <div className="comment-info">
                                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                {(comment.userId?._id === user?._id || post?.userId?._id === user?._id) && (
                                                    <button 
                                                        className="delete-comment" 
                                                        title="Delete comment"
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-comments" style={{textAlign: 'center', color: '#8e8e8e', marginTop: '50px'}}>Chưa có bình luận nào.</p>
                            )}
                        </div>

                        <div className="instagram-action-bar">
                            <div className="action-buttons">
                                <button 
                                    className={`like-btn ${isLiked ? 'liked' : ''}`} 
                                    onClick={toggleLike}
                                >
                                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                                </button>
                                <button className="like-btn" style={{cursor: 'default'}}>
                                    <FaRegComment />
                                </button>
                            </div>
                            <span className="like-counter">{likeCount} likes</span>
                            <span className="post-time" style={{fontSize: '10px', marginTop: '-5px'}}>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>

                        <form className="comment-input-area" onSubmit={handleAddComment}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Thêm bình luận..."
                            />
                            <button type="submit" disabled={actionLoading || !newComment.trim()}>
                                {actionLoading ? '...' : 'Đăng'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;