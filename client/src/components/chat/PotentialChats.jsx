import React from 'react'
import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const PotentialChats = () => {
    const {user} = useContext(AuthContext);
    const {potentialChats, createChat} = useContext(ChatContext);


    return (
        <div className="potential-chats-section">
            <div className='potential-list'>
                {potentialChats &&
                    potentialChats.map((u, index) => {
                        return (
                            <div 
                                className='potential-user-avatar' 
                                key={index} 
                                onClick={() => createChat(u._id, user._id)}
                                title={`Chat with ${u.username}`}
                            >
                                <div className="avatar-ring">
                                    <img 
                                        src={u.avatar || '/default-avatar.png'} 
                                        alt={u.username} 
                                        className='avatar-img-circle' 
                                    />
                                </div>
                                <span className='online-dot-mini'></span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

export default PotentialChats;