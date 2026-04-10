import React, { useContext, useState, useEffect, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import io from 'socket.io-client';
import '../../styles/ChatBox.css';

const ChatBox = () => {
    const {
        currentChat,
        messages,
        isMessagesLoading,
        sendTextMessage,
        addIncomingMessage,
        deleteMessage,
        handleMessageDeleted
    } = useContext(ChatContext);

    const { user } = useContext(AuthContext);

    const [textMessage, setTextMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // CONNECT SOCKET
    useEffect(() => {
        const token = localStorage.getItem('token');

        const newSocket = io('http://localhost:5000', {
            auth: { token }
        });

        setSocket(newSocket);

        newSocket.on('receiveMessage', (data) => {
            addIncomingMessage(data.chatId, data.message);
        });

        newSocket.on('messageDeleted', (data) => {
            handleMessageDeleted(data.messageId);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user, addIncomingMessage, handleMessageDeleted]);

    // JOIN CHAT ROOM
    useEffect(() => {
        if (!socket) return;

        if (currentChat?._id) {
            socket.emit('joinChat', currentChat._id);
        }

        return () => {
            if (currentChat?._id) {
                socket.emit('leaveChat', currentChat._id);
            }
        };
    }, [socket, currentChat]);

    // SEND MESSAGE
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (textMessage.trim() && socket) {
            const newMessage = await sendTextMessage(
                textMessage,
                user,
                currentChat._id
            );

            if (newMessage) {
                socket.emit('sendMessage', {
                    chatId: currentChat._id,
                    message: newMessage,
                });
            }

            setTextMessage('');
        }
    };

    // RECALL MESSAGE
    const handleRecallMessage = async (messageId) => {
        if (!window.confirm("Bạn có chắc muốn thu hồi?")) return;

        const response = await deleteMessage(messageId);

        if (response && !response.error) {
            socket.emit('deleteMessage', {
                chatId: currentChat._id,
                messageId
            });
        }
    };

    // NO CHAT SELECTED
    if (!currentChat) {
        return (
            <div className="chat-box-flex-column">
                <div className="no-chat-selected">
                    <h4>Select a chat to start messaging</h4>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-box-flex-column">

            {/* HEADER */}
            <div className="chat-header-modern">
                <h5>{currentChat?.name || 'Conversation'}</h5>
            </div>

            {/* MESSAGES */}
            <div className="messages-scroller-container">
                {isMessagesLoading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="messages-inner-stack">
                        {messages?.map((message, index) => (
                            <div
                                key={index}
                                className={`message-bubble-wrapper ${message.senderId === user._id
                                    ? 'self-end'
                                    : 'self-start'
                                    }`}
                            >
                                <div
                                    className={`message-blob ${message.senderId === user._id
                                        ? 'blob-own'
                                        : 'blob-other'
                                        } ${message.isDeleted ? 'message-is-deleted' : ''
                                        }`}
                                >

                                    {/* NÚT THU HỒI */}
                                    {String(message.senderId) === String(user?._id) && !message.isDeleted && (
                                        <button
                                            className="recall-btn-modern"
                                            onClick={() => handleRecallMessage(message._id)}
                                            title="Thu hồi"
                                        >
                                            <i className="fas fa-undo"></i>
                                        </button>
                                    )}

                                    {/* TEXT */}
                                    <p>{message.text}</p>

                                    {/* TIME */}
                                    <div className="blob-footer">
                                        <span>
                                            {new Date(message.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* INPUT */}
            <div className="input-bar-container">
                <form onSubmit={handleSendMessage} className="input-form-flex">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        className="modern-chat-input"
                    />
                    <button
                        type="submit"
                        className="modern-send-btn"
                        disabled={!textMessage.trim()}
                    >
                        ➤
                    </button>
                </form>
            </div>

        </div>
    );
};

export default ChatBox;