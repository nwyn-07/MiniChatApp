import React, { useState, useEffect, useContext, useRef, previewUrl,Fa } from 'react';
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
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null);
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

    // Xử lý khi chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file)); // Tạo đường dẫn tạm thời để xem trước
        }
    };

    // Xóa ảnh đã chọn trước khi post
    const removeSelectedImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        getAllPosts();
    }, []);


    const createPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const token = localStorage.getItem('token');
        
        // SỬ DỤNG FORMDATA THAY VÌ OBJECT THÔNG THƯỜNG
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (selectedImage) {
            formData.append('image', selectedImage); // 'image' phải khớp với tên field ở Backend (multer)
        }

        await axios.post('http://localhost:5000/api/posts', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Bắt buộc khi có file
            }
        });

        // Reset form sau khi đăng thành công
        setNewPostContent('');
        setSelectedImage(null);
        setPreviewUrl(null);
        fetchPosts(); // Load lại danh sách bài viết
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Đăng bài thất bại, hãy kiểm tra lại dữ liệu!');
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
            
            {/* 1. Giao diện Tạo Bài Viết Mới */}
            <div className="create-post">
                <form onSubmit={createPost}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Bạn đang nghĩ gì?"
                        rows="3"
                    />

                    {/* Hiển thị ảnh xem trước (Preview) nếu người dùng đã chọn ảnh */}
                    {previewUrl && (
                        <div className="image-preview-container">
                            <img src={previewUrl} alt="Preview" className="img-preview" />
                            <button type="button" className="remove-img-btn" onClick={removeSelectedImage}>
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="create-post-actions">
                        {/* Input file bị ẩn đi để custom giao diện bằng nút bấm */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        
                        {/* Nút kích hoạt chọn ảnh */}
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
                            
                            {/* Phần hiển thị nội dung chỉnh sửa nếu đang ở chế độ Edit */}
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
                                // Hiển thị nội dung bài viết bình thường
                                <div className="post-body">
                                    <p className="post-content">{post.content}</p>
                                    
                                    {/* Hiển thị ảnh của bài viết nếu có */}
                                    {post.image && (
                                        <div className="post-image-main">
                                            <img 
                                                src={`http://localhost:5000${post.image}`} 
                                                alt="Nội dung bài viết" 
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    <div className="post-actions">
                                        <span className="post-click-hint">Bấm để xem chi tiết, bình luận & cảm xúc</span>
                                        
                                        {/* Chỉ hiển thị nút sửa/xóa nếu là chủ bài viết */}
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
                                                        if(window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
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

            {/* 3. Modal Chi Tiết Bài Viết (Hiện lên khi click vào bài) */}
            {selectedPostId && (
                <PostDetail postId={selectedPostId} onClose={closePostDetail} />
            )}
        </div>
    );
};

export default Feed;
