const Reaction = require('../schemas/reactionSchema');

const addReaction = async (req, res) => {
    const userId = req.user._id;
    const { targetId, targetType, type } = req.body;

    try {
        if (!targetId || !targetType) {
            return res.status(400).json({ message: 'targetId and targetType are required' });
        }

        let reaction = await Reaction.findOne({
            targetId,
            userId,
            targetType,
        });

        if (reaction) {
            reaction.type = type || 'like';
            const response = await reaction.save();
            return res.status(200).json(response);
        }

        const newReaction = new Reaction({
            targetId,
            targetType,
            userId,
            type: type || 'like',
        });

        const response = await newReaction.save();
        res.status(201).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeReaction = async (req, res) => {
    const userId = req.user._id;
    const { reactionId } = req.params;

    try {
        const reaction = await Reaction.findById(reactionId);
        if (!reaction) {
            return res.status(404).json({ message: 'Reaction not found' });
        }

        if (reaction.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only remove your own reactions' });
        }

        await Reaction.findByIdAndDelete(reactionId);
        res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getReactionsByTarget = async (req, res) => {
    const { targetId } = req.params;

    try {
        const reactions = await Reaction.find({ targetId }).populate('userId', 'username email');
        const reactionSummary = {
            like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            sad: 0,
            angry: 0,
        };

        reactions.forEach((reaction) => {
            reactionSummary[reaction.type]++;
        });

        res.status(200).json({ reactions, summary: reactionSummary });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    addReaction,
    removeReaction,
    getReactionsByTarget,
};
