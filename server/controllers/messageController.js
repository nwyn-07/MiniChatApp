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
        const processedMessages = messages.map(msg => {
            if (msg.isDeleted) {
                return { ...msg.toObject(), text: "Tin nhắn đã bị thu hồi" };
            }
            return msg;
        });
        res.status(200).json(processedMessages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id.toString();

    try {
        const message = await messageSchema.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // KIỂM TRA QUYỀN: Chỉ người gửi mới được thu hồi tin nhắn
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this message' });
        }

        message.isDeleted = true;
        await message.save();
        
        res.status(200).json({ 
            message: "Message deleted successfully", 
            deletedMessageId: message._id,
            chatId: message.chatId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createMessage,
    getMessages,
    deleteMessage
}