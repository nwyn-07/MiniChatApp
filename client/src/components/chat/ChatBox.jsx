import React, { useContext, useState, useEffect, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { Container, Stack, Form, Button } from 'react-bootstrap';
import io from 'socket.io-client';
import '../../styles/ChatBox.css';

const ChatBox = () => {
    const { currentChat, messages, isMessagesLoading, sendTextMessage, addIncomingMessage } = useContext(ChatContext);
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

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('userJoin', user?._id);

        newSocket.on('receiveMessage', (data) => {
            console.log('Received message:', data);
            addIncomingMessage(data.chatId, data.message);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user, addIncomingMessage]);

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

    if (!currentChat) {
        return (
            <Container className="chat-box-container">
                <div className="no-chat-selected">
                    <i className="fas fa-comments"></i>
                    <h4>Select a chat to start messaging</h4>
                    <p>Choose a conversation from the list to begin chatting</p>
                </div>
            </Container>
        );
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (textMessage.trim() && socket) {
            const newMessage = await sendTextMessage(textMessage, user, currentChat._id);
            if (newMessage) {
                socket.emit('sendMessage', {
                    chatId: currentChat._id,
                    message: newMessage,
                });
            }
            setTextMessage('');
        }
    };

    return (
        <Container className="chat-box-container">
            <div className="chat-header">
                <div className="chat-info">
                    <h5>{currentChat?.name || 'Chat'}</h5>
                    <span className="online-status">
                        <i className="fas fa-circle"></i> Online
                    </span>
                </div>
            </div>

            <div className="messages-container">
                {isMessagesLoading ? (
                    <div className="loading-messages">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading messages...
                    </div>
                ) : (
                    <Stack gap={3} className="messages-stack">
                        {messages?.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${
                                    message.senderId === user._id ? 'own-message' : 'other-message'
                                }`}
                            >
                                <div className="message-content">
                                    <p>{message.text}</p>
                                    <span className="message-time">
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </Stack>
                )}
            </div>

            <div className="message-input-container">
                <Form onSubmit={handleSendMessage} className="message-form">
                    <Form.Group className="message-input-group">
                        <Form.Control
                            type="text"
                            placeholder="Type a message..."
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                            className="message-input"
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            className="send-button"
                            disabled={!textMessage.trim()}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        </Container>
    );
};

export default ChatBox;
