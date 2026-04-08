import React from 'react';
import {useFetchRecipientUser} from '../../hooks/useFetchRecipient';
import { Stack } from 'react-bootstrap';
import avatar from "../../assets/avatar.svg"

const UserChat = ({ chat, user }) => {
    const {recipientUser} = useFetchRecipientUser(chat, user);

    return (
    <Stack direction='horizontal' gap={3} className="user-card align-items-center p-2 justify-content-between" role="button">
        <div className='d-flex'>
            <div className='me-2'>
                <img src={avatar} height="40px" width="40px" style={{borderRadius: '50%'}} />
            </div>
            <div className='text-content'>
                <div className='name'>{recipientUser ? <div className="username">{recipientUser.username}</div> : 'Unknown User'}</div>
                <div className='text'>Click to start chatting...</div>
            </div>
        </div>
        <div className="d-flex flex-column align-items-end">
            <div className="date">Now</div>
            <div className="this-user-notification">0</div>
            <span className='user-online'></span>
        </div>
    </Stack>
    );
};

export default UserChat;
        