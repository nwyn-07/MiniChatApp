const express   = require('express');
const router    = express.Router();
const { checkLogin } = require('../utils/authHandler');
const { 
    createChat,
    findChat,
    findUserChats 
} = require('../controllers/chatController');

router.post('/', checkLogin, createChat);
router.get('/', checkLogin, findUserChats);
router.get('/find/:secondId', checkLogin, findChat);

module.exports = router;