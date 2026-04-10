const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        chatId: String,
        senderId: String,
        text: String,
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("message", messageSchema);