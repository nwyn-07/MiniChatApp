const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
    {
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        targetType: {
            type: String,
            enum: ['post', 'message', 'comment'],
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        type: {
            type: String,
            enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
            default: 'like',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('reaction', reactionSchema);
