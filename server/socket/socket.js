const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');
const Chat = require('../schemas/chatSchema');

const setupSocket = (io) => {
    const onlineUsers = new Map();

    // Middleware xác thực JWT cho Socket
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findById(decoded.id || decoded._id);
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.user = user; // Lưu thông tin user vào socket instance
            next();
        } catch (err) {
            console.log('Socket Auth Error:', err.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        console.log('--- Socket Connected ---');
        console.log('User:', socket.user.username);
        console.log('ID:', userId);

        // Tự động tham gia danh sách online dựa trên Token
        onlineUsers.set(userId, socket.id);
        io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));

        socket.on('joinChat', async (chatId) => {
            if (!chatId) return;

            try {
                // KIỂM TRA QUYỀN: User có thuộc members của Chat này không?
                const chat = await Chat.findById(chatId);
                
                // SỬA LỖI: So sánh ObjectId với String cần toString()
                const isMember = chat?.members?.some(m => m.toString() === userId);

                if (!chat || !isMember) {
                    console.log(`[AUTH FAILED] User ${userId} tried to join chat ${chatId}`);
                    return; 
                }

                socket.join(chatId);
                console.log(`[SUCCESS] User ${socket.user.username} joined room: ${chatId}`);
            } catch (err) {
                console.error('joinChat Error:', err);
            }
        });

        socket.on('leaveChat', (chatId) => {
            if (!chatId) return;
            socket.leave(chatId);
            console.log(`[LEAVE] User ${socket.user.username} left room: ${chatId}`);
        });

        // Handle sending chat messages
        socket.on('sendMessage', async (data) => {
            const { chatId, message } = data;
            if (!chatId) return;

            // Validate lại lần nữa trước khi phát tán tin nhắn
            if (message.senderId.toString() !== userId) {
                console.log('[SECURITY] Mismatched senderId in socket message');
                return;
            }

            console.log(`[MSG] From ${socket.user.username} to room ${chatId}: ${message.text?.substring(0, 20)}...`);
            socket.to(chatId).emit('receiveMessage', { chatId, message });
        });

        // Handle deleting/recalling messages
        socket.on('deleteMessage', (data) => {
            const { chatId, messageId } = data;
            if (!chatId || !messageId) return;

            console.log(`[DELETE] User ${socket.user.username} recalled msg ${messageId} in room ${chatId}`);
            socket.to(chatId).emit('messageDeleted', { chatId, messageId });
        });

        // Handle sending posts, comments, etc. (Broadcast public)
        socket.on('newPost', (post) => {
            io.emit('postCreated', post);
        });

        socket.on('newComment', (comment) => {
            io.emit('commentAdded', comment);
        });

        socket.on('newReaction', (reaction) => {
            io.emit('reactionAdded', reaction);
        });

        socket.on('friendRequest', (request) => {
            const receiverSocket = onlineUsers.get(request.receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('friendRequestReceived', request);
            }
        });

        socket.on('sendNotification', (notification) => {
            const userSocket = onlineUsers.get(notification.userId);
            if (userSocket) {
                io.to(userSocket).emit('notificationReceived', notification);
            }
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));
            console.log('User disconnected:', userId);
        });
    });
};

module.exports = setupSocket;
