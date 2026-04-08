import React from 'react'
import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const PotentialChats = () => {
    const {user} = useContext(AuthContext);
    const {potentialChats, createChat} = useContext(ChatContext);


    return (
        <>
        <div className='all-users'>
            <h5 className='potential-chats-title'>Start New Chat</h5>
            {potentialChats &&
                potentialChats.map((u, index) => {
                    return (
                        <div className='single-user' key={index} onClick={() => createChat(u._id, user._id)}>
                        <div className='user-info'>
                            <img src={u.avatar || '/default-avatar.png'} alt={u.username} className='user-avatar' />
                            <span className='username'>{u.username}</span>
                        </div>
                        <span className='user-online'></span>
                    </div>
                    );

                })}
        </div>
        </>
    );
}

export default PotentialChats;