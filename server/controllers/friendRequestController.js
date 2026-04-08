const FriendRequest = require('../schemas/friendRequestSchema');
const Notification = require('../schemas/notificationSchema');
const User = require('../schemas/userSchema');
const { createNotification } = require('./notificationController');

const sendFriendRequest = async (req, res) => {
    const senderId = req.user._id;
    const { receiverId, receiverUsername } = req.body;
    let finalReceiverId = receiverId;

    try {
        if (!finalReceiverId && receiverUsername) {
            const receiverUser = await User.findOne({ username: receiverUsername });
            if (!receiverUser) {
                return res.status(404).json({ message: 'Receiver username not found' });
            }
            finalReceiverId = receiverUser._id;
        }

        if (!finalReceiverId) {
            return res.status(400).json({ message: 'Receiver username or ID is required' });
        }

        if (senderId.toString() === finalReceiverId.toString()) {
            return res.status(400).json({ message: 'Cannot send friend request to yourself' });
        }

        let friendRequest = await FriendRequest.findOne({
            $or: [
                { senderId, receiverId: finalReceiverId },
                { senderId: finalReceiverId, receiverId: senderId },
            ],
        });

        if (friendRequest) {
            return res.status(400).json({ message: 'Friend request already exists' });
        }

        const newFriendRequest = new FriendRequest({
            senderId,
            receiverId: finalReceiverId,
            status: 'pending',
        });

        const response = await newFriendRequest.save();
        await createNotification(
            finalReceiverId,
            'friendRequest',
            `Received a friend request`,
            response._id
        );

        res.status(201).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPendingRequests = async (req, res) => {
    const userId = req.user._id;

    try {
        const requests = await FriendRequest.find({ receiverId: userId, status: 'pending' })
            .populate('senderId', 'username email')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const acceptFriendRequest = async (req, res) => {
    const userId = req.user._id;
    const { requestId } = req.params;

    try {
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (friendRequest.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only accept your own requests' });
        }

        friendRequest.status = 'accepted';
        const response = await friendRequest.save();

        await createNotification(
            friendRequest.senderId,
            'friendRequest',
            `Accepted your friend request`,
            response._id
        );

        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const rejectFriendRequest = async (req, res) => {
    const userId = req.user._id;
    const { requestId } = req.params;

    try {
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (friendRequest.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only reject your own requests' });
        }

        friendRequest.status = 'rejected';
        const response = await friendRequest.save();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    sendFriendRequest,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
};
