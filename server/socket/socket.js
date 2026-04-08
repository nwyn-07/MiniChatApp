const setupSocket = (io) => {
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // User joins with their userId
        socket.on('userJoin', (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));
            console.log('User joined:', userId, 'Socket:', socket.id);
        });

        socket.on('joinChat', (chatId) => {
            if (!chatId) return;
            socket.join(chatId);
            console.log('Socket joined chat room:', chatId, socket.id);
        });

        socket.on('leaveChat', (chatId) => {
            if (!chatId) return;
            socket.leave(chatId);
            console.log('Socket left chat room:', chatId, socket.id);
        });

        // Handle sending chat messages
        socket.on('sendMessage', (data) => {
            const { chatId, message } = data;
            if (!chatId) return;
            socket.to(chatId).emit('receiveMessage', { chatId, message });
            console.log('Message sent to chat room:', chatId, message);
        });

        // Handle sending posts
        socket.on('newPost', (post) => {
            io.emit('postCreated', post);
            console.log('New post created:', post._id);
        });

        // Handle posting comments
        socket.on('newComment', (comment) => {
            io.emit('commentAdded', comment);
            console.log('New comment added:', comment._id);
        });

        // Handle reactions
        socket.on('newReaction', (reaction) => {
            io.emit('reactionAdded', reaction);
            console.log('New reaction:', reaction.type);
        });

        // Handle friend request
        socket.on('friendRequest', (request) => {
            const receiverSocket = onlineUsers.get(request.receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('friendRequestReceived', request);
            }
            console.log('Friend request sent:', request.senderId, '->', request.receiverId);
        });

        // Handle notifications
        socket.on('sendNotification', (notification) => {
            const userSocket = onlineUsers.get(notification.userId);
            if (userSocket) {
                io.to(userSocket).emit('notificationReceived', notification);
            }
            console.log('Notification sent to user:', notification.userId);
        });

        // User disconnect
        socket.on('disconnect', () => {
            let disconnectedUserId;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));
            console.log('User disconnected:', disconnectedUserId, 'Socket:', socket.id);
        });
    });
};

module.exports = setupSocket;
