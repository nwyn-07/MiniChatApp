import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/PostDetail.css';

const PostDetail = ({ postId, onClose }) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [reactions, setReactions] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (postId) {
            getPostDetail();
            getComments();
            getReactions();
        }
    }, [postId]);

    const getPostDetail = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/posts/${postId}`
            );
            setPost(response.data);
        } catch (error) {
            console.log('Error fetching post:', error);
        }
    };

    const getComments = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/comments/${postId}`
            );
            setComments(response.data);
        } catch (error) {
            console.log('Error fetching comments:', error);
        }
    };

    const getReactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/reactions/${postId}`
            );
            setReactions(response.data.summary);
        } catch (error) {
            console.log('Error fetching reactions:', error);
        }
    };

    const addComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert('Comment cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/comments',
                { postId, text: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.log('Error adding comment:', error);
            alert('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    const addReaction = async (type) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/reactions',
                { targetId: postId, targetType: 'post', type },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            getReactions();
        } catch (error) {
            console.log('Error adding reaction:', error);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setComments(comments.filter((c) => c._id !== commentId));
        } catch (error) {
            console.log('Error deleting comment:', error);
        }
    };

    if (!post) return <div>Loading...</div>;

    return (
        <div className="post-detail-modal">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>
                    ×
                </button>

                {/* Post */}
                <div className="post-detail">
                    <h3>{post.userId?.username}</h3>
                    <p>{post.content}</p>
                    <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>

                {/* Reactions */}
                <div className="reactions">
                    <div className="reaction-buttons">
                        {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map(
                            (type) => (
                                <button
                                    key={type}
                                    onClick={() => addReaction(type)}
                                    className="reaction-btn"
                                >
                                    {type} {reactions?.[type] || 0}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Comments Form */}
                <div className="comments-form">
                    <form onSubmit={addComment}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Comment'}
                        </button>
                    </form>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                                <strong>{comment.userId?.username}</strong>
                                <small>
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                            <p>{comment.text}</p>
                            {comment.userId?._id === user?._id && (
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteComment(comment._id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
