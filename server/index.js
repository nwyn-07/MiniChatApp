const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');

const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())
app.use('/api/users', userRoute);

app.post

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.get('/', (req, res, )=> {
  res.send('Hello World!');
});

app.listen(port,(req,res)=>{
    console.log(`Server is running on port ${port}`)
});

mongoose.connect(uri).then(()=>{
    console.log('MongoDB connected successfully')
}).catch((err)=>{
    console.log('MongoDB connection error: ', err)
})
