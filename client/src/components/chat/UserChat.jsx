import React from 'react';
import {useFetchRecipientUser} from '../../hooks/useFetchRecipient';
import { Stack } from 'react-bootstrap';
import avatar from "../../assets/avatar.svg"

const UserChat = ({ chat, user }) => {
    const {recipientUser} = useFetchRecipientUser(chat, user);

    return (
        <div className="sidebar-chat-card">
            <div className='card-main-info'>
                <div className='avatar-wrapper'>
                    <img src={recipientUser?.avatar || avatar} alt="avatar" className="chat-avatar" />
                    <span className={`status-indicator ${recipientUser ? 'online' : 'offline'}`}></span>
                </div>
                <div className='chat-meta'>
                    <div className='chat-name'>{recipientUser ? recipientUser.username : 'Unknown User'}</div>
                    <div className='last-msg-preview'>Click to start chatting...</div>
                </div>
            </div>
            <div className="card-right-info">
                <div className="chat-date">Now</div>
                {/* <div className="notification-badge">2</div> */}
            </div>
        </div>
    );
};

export default UserChat;
        