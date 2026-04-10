const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const { 
    createMessage,
    getMessages,
    deleteMessage
} = require('../controllers/messageController');

router.post('/', checkLogin, createMessage);
router.get('/:chatId', checkLogin, getMessages);
router.delete('/:messageId', checkLogin, deleteMessage);

module.exports = router;