const express = require('express');
const router = express.Router();
const User = require('../schemas/users');

// Create a new user
router.get('/register', (req, res) => {
    res.send('Register');
});


module.exports = router;