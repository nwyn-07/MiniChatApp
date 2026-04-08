const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const {
    sendFriendRequest,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
} = require('../controllers/friendRequestController');

router.post('/', checkLogin, sendFriendRequest);
router.get('/', checkLogin, getPendingRequests);
router.patch('/:requestId/accept', checkLogin, acceptFriendRequest);
router.patch('/:requestId/reject', checkLogin, rejectFriendRequest);

module.exports = router;
