const Notification = require('../schemas/notificationSchema');

const createNotification = async (userId, type, message, relatedId = null) => {
    try {
        const notification = new Notification({
            userId,
            type,
            message,
            relatedId,
            isRead: false,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.log('Error creating notification:', error);
    }
};

const getNotifications = async (req, res) => {
    const userId = req.user._id;

    try {
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAllAsRead = async (req, res) => {
    const userId = req.user._id;

    try {
        await Notification.updateMany({ userId }, { isRead: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;

    try {
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
