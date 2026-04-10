import {createContext, useState, useEffect} from "react";
import { baseURL, postRequest, getRequest, deleteRequest } from "../utils/service";
import { useCallback } from "react";
export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user}) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messageError, setMessageError] = useState(null);
    const [messages, setMessages] = useState(null);

    // Xử lý cập nhật cục bộ khi tin nhắn bị thu hồi
    const handleMessageDeleted = useCallback((messageId) => {
        setMessages((prev) => {
            if (!prev) return prev;
            return prev.map((msg) => {
                if (msg._id === messageId) {
                    return { ...msg, isDeleted: true, text: "Tin nhắn đã bị thu hồi" };
                }
                return msg;
            });
        });
    }, []);

    const deleteMessage = useCallback(async (messageId) => {
        const response = await deleteRequest(`${baseURL}/messages/${messageId}`);

        if (response.error) {
            console.log("Error deleting message:", response.message);
            return { error: true };
        }

        // Cập nhật state nội bộ ngay lập tức
        handleMessageDeleted(messageId);
        return response; // Trả về để socket emit
    }, [handleMessageDeleted]);

    useEffect(() => {
        const getUsers = async () => {
            if(!user?._id) return;
            const response = await getRequest(`${baseURL}/users/${user._id}/friends`);

            if (response.error) {
                return console.log("Error fetching users:", response.message);
            }

            const pChats = response.filter((u) => {
                let isChatCreated = false;
                if(user?._id === u._id) return false;

                if(userChats){
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    });
                }
                return !isChatCreated;
            });
            setPotentialChats(pChats);
        }
        getUsers();
    },[userChats]);

    useEffect(() => {
        const getUserChats = async () => {

            if(user?._id){

                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseURL}/chats`);
                
                setIsUserChatsLoading(false);
                if (response.error) {
                    return setUserChatsError(response);
                }
                setUserChats(response);
            }

        }
        getUserChats();
            
    }, [user]);


    const fetchMessagesForChat = useCallback(async (chatId) => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        setIsMessagesLoading(true);
        setMessageError(null);

        const response = await getRequest(`${baseURL}/messages/${chatId}`);
        setIsMessagesLoading(false);
        if (response.error) {
            return setMessageError(response);
        }
        setMessages(response);
    }, []);

    useEffect(() => {
        fetchMessagesForChat(currentChat?._id);
    }, [currentChat, fetchMessagesForChat]);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(
            `${baseURL}/chats`,
            JSON.stringify({ secondId: firstId })
        );
        if (response.error) {
            return console.log("Error creating chat:", response.message);
        }
        setUserChats((prev) => [...(prev || []), response]);
        setCurrentChat(response);
    }, []);

    const sendTextMessage = useCallback(async (text, user, chatId) => {
        if (!chatId || !user?._id) return;

        const response = await postRequest(
            `${baseURL}/messages`,
            JSON.stringify({ chatId, senderId: user._id, text })
        );

        if (response.error) {
            console.log('Error sending message:', response.message);
            return;
        }

        setMessages((prev) => (prev ? [...prev, response] : [response]));
        return response;
    }, []);

    const addIncomingMessage = useCallback((chatId, message) => {
        if (currentChat?._id !== chatId) return;
        setMessages((prev) => (prev ? [...prev, message] : [message]));
    }, [currentChat]);

    return (
        <ChatContext.Provider value={{
            userChats,
            isUserChatsLoading,
            userChatsError,
            potentialChats,
            createChat,
            updateCurrentChat,
            currentChat,
            messages,
            isMessagesLoading,
            sendTextMessage,
            fetchMessagesForChat,
            addIncomingMessage,
            deleteMessage,
            handleMessageDeleted
        }}>
            {children}
        </ChatContext.Provider>
    );
}