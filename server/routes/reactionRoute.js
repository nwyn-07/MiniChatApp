const express = require('express');
const router = express.Router();
const { checkLogin } = require('../utils/authHandler');
const {
    addReaction,
    removeReaction,
    getReactionsByTarget,
} = require('../controllers/reactionController');

router.post('/', checkLogin, addReaction);
router.delete('/:reactionId', checkLogin, removeReaction);
router.get('/:targetId', getReactionsByTarget);

module.exports = router;
