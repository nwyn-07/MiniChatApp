const express   = require('express');
const router    = express.Router();
const { checkLogin } = require('../utils/authHandler');
const { 
    createChat,
    findChat,
    findUserChats 
} = require('../controllers/chatController');

router.post('/', createChat);
router.get('/:userId', findUserChats);
router.get('/find/:userId/:secondId', findChat);

module.exports = router;