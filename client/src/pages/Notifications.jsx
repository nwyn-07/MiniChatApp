import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        getNotifications();
        const interval = setInterval(getNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const getNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/notifications',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setNotifications(response.data);
        } catch (error) {
            console.log('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/notifications/${notificationId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            getNotifications();
        } catch (error) {
            console.log('Error marking as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/notifications/${notificationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            getNotifications();
        } catch (error) {
            console.log('Error deleting notification:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                'http://localhost:5000/api/notifications/markAll/read',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            getNotifications();
        } catch (error) {
            console.log('Error marking all as read:', error);
        }
    };

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2>Notifications</h2>
                {notifications.some((n) => !n.isRead) && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                        Mark All as Read
                    </button>
                )}
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p>No notifications</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`notification-item ${
                                notification.isRead ? 'read' : 'unread'
                            }`}
                        >
                            <div className="notification-content">
                                <p className="notification-message">
                                    {notification.message}
                                </p>
                                <small className="notification-type">
                                    {notification.type}
                                </small>
                            </div>
                            <div className="notification-actions">
                                {!notification.isRead && (
                                    <button
                                        className="read-btn"
                                        onClick={() => markAsRead(notification._id)}
                                    >
                                        Mark Read
                                    </button>
                                )}
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteNotification(notification._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
