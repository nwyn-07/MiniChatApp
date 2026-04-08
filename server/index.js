const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const { checkLogin } = require('./utils/authHandler');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

require('dotenv').config()

console.log('JWT_SECRET_KEY loaded:', process.env.JWT_SECRET_KEY ? '✓ YES' : '✗ NO');

app.use(cors())
app.use(cookieParser())
app.use(express.json())

// Mount existing routes
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.get('/', (req, res, )=> {
  res.send('Hello World!');
});

server.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
});

// Setup Socket.io
setupSocket(io);

mongoose.connect(uri).then(()=>{
    console.log('MongoDB connected successfully')
}).catch((err)=>{
    console.log('MongoDB connection error: ', err)
})
