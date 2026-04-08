import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/FriendRequests.css';

const FriendRequests = () => {
    const [requests, setRequests] = useState([]);
    const [receiverUsername, setReceiverUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    React.useEffect(() => {
        getPendingRequests();
    }, []);

    const getPendingRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/friendRequests',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setRequests(response.data);
        } catch (error) {
            console.log('Error fetching requests:', error);
        }
    };

    const sendFriendRequest = async (e) => {
        e.preventDefault();
        if (!receiverUsername.trim()) {
            alert('Please enter a username');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/friendRequests',
                { receiverUsername },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert('Friend request sent!');
            setReceiverUsername('');
            getPendingRequests();
        } catch (error) {
            console.log('Error sending request:', error);
            alert('Failed to send friend request');
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/friendRequests/${requestId}/accept`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            getPendingRequests();
        } catch (error) {
            console.log('Error accepting request:', error);
            alert('Failed to accept request');
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/friendRequests/${requestId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            getPendingRequests();
        } catch (error) {
            console.log('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    return (
        <div className="friend-requests-container">
            <h2>Friend Requests</h2>

            {/* Send Friend Request Form */}
            <div className="send-request">
                <form onSubmit={sendFriendRequest}>
                    <input
                        type="text"
                        value={receiverUsername}
                        onChange={(e) => setReceiverUsername(e.target.value)}
                        placeholder="Enter username to send friend request"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </form>
            </div>

            {/* Pending Requests List */}
            <div className="requests-list">
                <h3>Pending Requests</h3>
                {requests.length === 0 ? (
                    <p>No pending requests</p>
                ) : (
                    requests.map((request) => (
                        <div key={request._id} className="request-item">
                            <div className="request-info">
                                <h4>{request.senderId?.username || 'Anonymous'}</h4>
                                <p>{request.senderId?.email}</p>
                            </div>
                            <div className="request-actions">
                                <button
                                    className="accept-btn"
                                    onClick={() => acceptRequest(request._id)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={() => rejectRequest(request._id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FriendRequests;
