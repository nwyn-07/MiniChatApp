import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostDetail from '../components/PostDetail';
import '../styles/Feed.css';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editPostContent, setEditPostContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        getAllPosts();
    }, []);

    const getAllPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/posts');
            setPosts(response.data);
        } catch (error) {
            console.log('Error fetching posts:', error);
        }
    };

    const createPost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) {
            alert('Post content cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/posts',
                { content: newPostContent, images: [] },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPosts([response.data, ...posts]);
            setNewPostContent('');
        } catch (error) {
            console.log('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPosts(posts.filter((post) => post._id !== postId));
        } catch (error) {
            console.log('Error deleting post:', error);
            alert('Failed to delete post');
        }
    };

    const startEditPost = (e, post) => {
        e.stopPropagation();
        setEditingPostId(post._id);
        setEditPostContent(post.content || '');
    };

    const cancelEditPost = (e) => {
        e.stopPropagation();
        setEditingPostId(null);
        setEditPostContent('');
    };

    const saveEditPost = async (e, postId) => {
        e.stopPropagation();
        if (!editPostContent.trim()) {
            alert('Post content cannot be empty');
            return;
        }

        setEditLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `http://localhost:5000/api/posts/${postId}`,
                { content: editPostContent },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
            setEditingPostId(null);
            setEditPostContent('');
        } catch (error) {
            console.log('Error updating post:', error);
            alert('Failed to update post');
        } finally {
            setEditLoading(false);
        }
    };

    const openPostDetail = (postId) => {
        setSelectedPostId(postId);
    };

    const closePostDetail = () => {
        setSelectedPostId(null);
    };

    return (
        <div className="feed-container">
            <h2>Feed</h2>
            
            {/* Create Post Form */}
            <div className="create-post">
                <form onSubmit={createPost}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        rows="4"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </form>
            </div>

            {/* Posts List */}
            <div className="posts-list">
                {posts.map((post) => (
                    <div key={post._id} className="post-item" onClick={() => openPostDetail(post._id)}>
                        <div className="post-header">
                            <h4>{post.userId?.username || 'Anonymous'}</h4>
                            <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                        </div>
                        {editingPostId === post._id ? (
                            <div className="edit-post-area" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                    className="edit-textarea"
                                    value={editPostContent}
                                    onChange={(e) => setEditPostContent(e.target.value)}
                                    rows={4}
                                />
                                <div className="edit-actions">
                                    <button
                                        type="button"
                                        className="save-btn"
                                        onClick={(e) => saveEditPost(e, post._id)}
                                        disabled={editLoading}
                                    >
                                        {editLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={cancelEditPost}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="post-content">{post.content}</p>
                                <div className="post-actions">
                                    <span className="post-click-hint">Click to view details, comments & reactions</span>
                                    {post.userId?._id === user?._id && (
                                        <div className="post-action-buttons">
                                            <button
                                                type="button"
                                                className="edit-btn"
                                                onClick={(e) => startEditPost(e, post)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePost(post._id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Post Detail Modal */}
            {selectedPostId && (
                <PostDetail postId={selectedPostId} onClose={closePostDetail} />
            )}
        </div>
    );
};

export default Feed;
