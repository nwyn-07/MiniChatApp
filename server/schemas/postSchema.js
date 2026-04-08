const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('post', postSchema);
