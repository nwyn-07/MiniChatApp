const messageSchema = require('../schemas/messageSchema');

const createMessage = async (req, res) => {

    const { chatId, senderId, text } = req.body;
    const newMessage = new messageSchema({
        chatId,
        senderId,
        text,
    });
    try {
        const response = await newMessage.save();
        res.status(200).json(response);

    }catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getMessages = async (req, res) => {
    const chatId = req.params.chatId;
    try {
        const messages = await messageSchema.find({ chatId });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createMessage,
    getMessages
}