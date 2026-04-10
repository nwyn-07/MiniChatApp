import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { Container, Stack } from 'react-bootstrap';
import UserChat from '../components/chat/UserChat';
import PotentialChats from '../components/chat/PotentialChats';
import ChatBox from '../components/chat/ChatBox';

import '../styles/ChatDashboard.css';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, userChatsError, updateCurrentChat, currentChat } = useContext(ChatContext);
    
    return (
        <div className="chat-dashboard-page">
            <div className="chat-dashboard-container">
                {/* SIDEBAR BÊN TRÁI */}
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <h3>Messages</h3>
                    </div>
                    
                    {/* Danh bạ bạn bè gợi ý (Nằm ngang) */}
                    <PotentialChats />

                    {/* Danh sách các cuộc hội thoại đã có */}
                    <div className="chat-history-list">
                        {isUserChatsLoading && (
                            <div className="p-4 text-center">
                                <span className="spinner-border spinner-border-sm text-primary"></span>
                            </div>
                        )}
                        
                        {(!isUserChatsLoading && (!userChats || userChats.length === 0)) ? (
                            <div className="p-4 text-center text-muted" style={{fontSize: '14px'}}>
                                Chưa có cuộc hội thoại nào.
                            </div>
                        ) : (
                            userChats?.map((chat, index) => (
                                <div 
                                    key={index} 
                                    className={`chat-item-wrapper ${currentChat?._id === chat._id ? 'active' : ''}`}
                                    onClick={() => updateCurrentChat(chat)}
                                >
                                    <UserChat chat={chat} user={user} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* KHÔNG GIAN CHAT CHÍNH BÊN PHẢI */}
                <div className="chat-main-view">
                    {currentChat ? (
                        <ChatBox />
                    ) : (
                        <div className="chat-placeholder">
                            <div className="placeholder-icon">
                                <i className="fas fa-comment-dots"></i>
                            </div>
                            <h4>Your Messages</h4>
                            <p>Select a friend from the list or start a new conversation to begin chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;