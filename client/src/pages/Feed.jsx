import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostDetail from '../components/PostDetail';
import { FaImage, FaTimes } from 'react-icons/fa';
import '../styles/Feed.css';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editPostContent, setEditPostContent] = useState('');

    // State cho việc SỬA bài viết
    const [editExistingImages, setEditExistingImages] = useState([]); // Ảnh cũ từ server
    const [editSelectedImages, setEditSelectedImages] = useState([]); // File ảnh mới chọn
    const [editPreviewUrls, setEditPreviewUrls] = useState([]); // URL xem trước ảnh mới
    const editFileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    // State cho việc TẠO bài viết mới
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

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

    // --- LOGIC TẠO BÀI VIẾT MỚI ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedImages(files);
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(urls);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImages([]);
        setPreviewUrls([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const createPost = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (selectedImages && selectedImages.length > 0) {
                selectedImages.forEach(file => {
                    formData.append('images', file);
                });
            }

            await axios.post('http://localhost:5000/api/posts', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setNewPostContent('');
            setSelectedImages([]);
            setPreviewUrls([]);
            getAllPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Đăng bài thất bại!');
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC SỬA BÀI VIẾT ---
    const handleEditImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setEditSelectedImages(prev => [...prev, ...files]);
            const urls = files.map(file => URL.createObjectURL(file));
            setEditPreviewUrls(prev => [...prev, ...urls]);
        }
    };

    const removeExistingImage = (url) => {
        setEditExistingImages(prev => prev.filter(img => img !== url));
    };

    const removeEditSelectedImage = (index) => {
        setEditSelectedImages(prev => prev.filter((_, i) => i !== index));
        setEditPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const startEditPost = (e, post) => {
        e.stopPropagation();
        setEditingPostId(post._id);
        setEditPostContent(post.content || '');
        setEditExistingImages(post.images || []);
        setEditSelectedImages([]);
        setEditPreviewUrls([]);
    };

    const cancelEditPost = (e) => {
        if (e) e.stopPropagation();
        setEditingPostId(null);
        setEditPostContent('');
        setEditExistingImages([]);
        setEditSelectedImages([]);
        setEditPreviewUrls([]);
    };

    const saveEditPost = async (e, postId) => {
        e.stopPropagation();
        if (!editPostContent.trim()) {
            alert('Nội dung không được để trống');
            return;
        }

        setEditLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', editPostContent);

            // Gửi danh sách ảnh cũ muốn giữ lại
            editExistingImages.forEach(img => {
                formData.append('existingImages', img);
            });

            // Gửi các file ảnh mới thêm
            editSelectedImages.forEach(file => {
                formData.append('images', file);
            });

            const response = await axios.patch(
                `http://localhost:5000/api/posts/${postId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );
            setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
            cancelEditPost();
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Cập nhật thất bại');
        } finally {
            setEditLoading(false);
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

    const openPostDetail = (postId) => {
        setSelectedPostId(postId);
    };

    const closePostDetail = () => {
        setSelectedPostId(null);
    };

    return (
        <div className="feed-container">
            <h2>Feed</h2>

            {/* 1. Giao diện Tạo Bài Viết Mới */}
            <div className="create-post">
                <form onSubmit={createPost}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Bạn đang nghĩ gì?"
                        rows="3"
                    />

                    {previewUrls.length > 0 && (
                        <div className="image-preview-container" style={{ position: 'relative', display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', padding: '10px', background: '#333', borderRadius: '5px' }}>
                            {previewUrls.map((url, index) => (
                                <img key={index} src={url} alt={`Preview ${index}`} className="img-preview" style={{ height: '80px', borderRadius: '5px', objectFit: 'cover' }} />
                            ))}
                            <button type="button" className="remove-img-btn" onClick={removeSelectedImage} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="create-post-actions">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="add-image-btn"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <FaImage /> Thêm ảnh
                        </button>
                        <button type="submit" className="submit-post-btn" disabled={loading}>
                            {loading ? 'Đang đăng...' : 'Đăng bài'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 2. Danh sách Bài Viết */}
            <div className="posts-list">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post._id} className="post-item" onClick={() => openPostDetail(post._id)}>
                            <div className="post-header">
                                <div className="post-user-info">
                                    <h4>{post.userId?.username || 'Người dùng ẩn danh'}</h4>
                                    <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                                </div>
                            </div>

                            {editingPostId === post._id ? (
                                <div className="edit-post-area" onClick={(e) => e.stopPropagation()}>
                                    <textarea
                                        className="edit-textarea"
                                        value={editPostContent}
                                        onChange={(e) => setEditPostContent(e.target.value)}
                                        rows={4}
                                    />

                                    {/* QUẢN LÝ ẢNH KHI SỬA */}
                                    <div className="edit-image-management" style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <h6 style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Hình ảnh bài viết:</h6>

                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {/* ẢNH CŨ */}
                                            {editExistingImages.map((img, idx) => (
                                                <div key={`old-${idx}`} style={{ position: 'relative' }}>
                                                    <img src={`http://localhost:5000${img}`} alt="Existing" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    <button
                                                        onClick={() => removeExistingImage(img)}
                                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* ẢNH MỚI CHỌN THÊM */}
                                            {editPreviewUrls.map((url, idx) => (
                                                <div key={`new-${idx}`} style={{ position: 'relative' }}>
                                                    <img src={url} alt="New Preview" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', border: '2px solid #52c41a' }} />
                                                    <button
                                                        onClick={() => removeEditSelectedImage(idx)}
                                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* NÚT THÊM ẢNH KHI SỬA */}
                                            <button 
                                                type="button"
                                                onClick={() => editFileInputRef.current.click()}
                                                style={{ width: '60px', height: '60px', borderRadius: '4px', border: '1px dashed rgba(0,0,0,0.3)', background: 'transparent', color: 'black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifySelf: 'center' }}
                                            >
                                                <FaImage style={{ margin: '0 auto' }} />
                                            </button>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                ref={editFileInputRef}
                                                onChange={handleEditImageChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="edit-actions">
                                        <button
                                            type="button"
                                            className="save-btn"
                                            onClick={(e) => saveEditPost(e, post._id)}
                                            disabled={editLoading}
                                        >
                                            {editLoading ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={cancelEditPost}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="post-body">
                                    <p className="post-content">{post.content}</p>

                                    {(post.images && post.images.length > 0) && (
                                        <div className="post-images-grid" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                                            {post.images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={`http://localhost:5000${img}`}
                                                    alt={`Post image ${idx}`}
                                                    loading="lazy"
                                                    style={{ width: post.images.length === 1 ? '100%' : 'calc(50% - 5px)', borderRadius: '8px', objectFit: 'cover' }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="post-actions">
                                        <span className="post-click-hint">Bấm để xem chi tiết, bình luận & cảm xúc</span>
                                        {post.userId?._id === user?._id && (
                                            <div className="post-action-buttons">
                                                <button
                                                    type="button"
                                                    className="edit-btn"
                                                    onClick={(e) => startEditPost(e, post)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
                                                            deletePost(post._id);
                                                        }
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-posts">Chưa có bài viết nào để hiển thị.</p>
                )}
            </div>

            {selectedPostId && (
                <PostDetail postId={selectedPostId} onClose={closePostDetail} />
            )}
        </div>
    );
};

export default Feed;
