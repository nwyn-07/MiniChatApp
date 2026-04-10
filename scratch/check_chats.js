const mongoose = require('mongoose');
const Chat = require('./server/schemas/chatSchema');
const uri = 'mongodb+srv://nhuquynh:Ihtwyn131220@cluster0.sltyepc.mongodb.net/miniChatApp?retryWrites=true&w=majority';

async function check() {
    await mongoose.connect(uri);
    const u1 = '69d60bedd23af6e76aa0a3d1'; // qnn
    const u2 = '69d68e0a2bd142c5357014a4'; // nguyenq
    
    console.log('Searching for chats between', u1, 'and', u2);
    const chats = await Chat.find({
        members: { $all: [u1, u2] }
    });
    
    console.log('Found', chats.length, 'chats:');
    console.log(JSON.stringify(chats, null, 2));
    
    process.exit();
}

check().catch(console.error);
