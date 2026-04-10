//create chat
const chatSchema = require("../schemas/chatSchema");

const createChat = async (req, res) => {
    const firstId = req.user._id;
    const { secondId } = req.body;


    try{
        const chat = await chatSchema.findOne({
            members: { $all: [firstId.toString(), secondId.toString()] },
        });

        if(chat) return res.status(200).json(chat);

        const newChat = new chatSchema({
            members: [firstId.toString(), secondId.toString()],
        });
        const response = await newChat.save();
        res.status(200).json(response);

    }catch(error){
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });

    };
};

const findUserChats = async (req, res) => {
    const userId = req.user._id.toString();
    try {
        const chats = await chatSchema.find({
            members: { $in: [userId] },
        });

        res.status(200).json(chats);

    }catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const findChat = async (req, res) => {
    const firstId = req.user._id.toString();
    const { secondId } = req.params;
    
    try {
        const chat = await chatSchema.find({
            members: { $all: [firstId, secondId] },
        });

        res.status(200).json(chat);

    }catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    createChat,
    findUserChats,
    findChat

};
