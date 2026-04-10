const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const setupSocket = require('./socket/socket');
const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');
const messageRoute = require('./routes/messageRoute');
const postRoute = require('./routes/postRoute');
const commentRoute = require('./routes/commentRoute');
const reactionRoute = require('./routes/reactionRoute');
const friendRequestRoute = require('./routes/friendRequestRoute');
const notificationRoute = require('./routes/notificationRoute');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('ATLAS_URI loaded:', process.env.ATLAS_URI ? '✓ YES' : '✗ NO');
console.log('JWT_SECRET_KEY loaded:', process.env.JWT_SECRET_KEY ? '✓ YES' : '✗ NO');
app.use(cors())
app.use(cookieParser())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount existing routes
app.use('/api/users', userRoute);
app.use('/api/chats', chatRoute);
app.use('/api/messages', messageRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);
app.use('/api/reactions', reactionRoute);
app.use('/api/friendRequests', friendRequestRoute);
app.use('/api/notifications', notificationRoute);

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.get('/', (req, res, )=> {
  res.send('Hello World!');
});

// Khởi động Server & Socket sớm để App hoạt động
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
setupSocket(io);

// Kết nối DB ngầm
mongoose.connect(uri).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.log('CRITICAL: MongoDB connection error: ', err);
});
