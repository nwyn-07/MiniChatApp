const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../controllers/notificationController');

router.get('/', checkLogin, getNotifications);
router.patch('/:notificationId', checkLogin, markAsRead);
router.patch('/markAll/read', checkLogin, markAllAsRead);
router.delete('/:notificationId', checkLogin, deleteNotification);

module.exports = router;
