const express = require('express');
const router = express.Router();
const { RegisterValidator, handleResultValidator } = require('../utils/validatorHandler');
const { registerUser,
    loginUser,
    findUser,
    SuccessLogin,
    getUsers } = require('../controllers/userController');

// Create a new user
router.post('/register',RegisterValidator,handleResultValidator, registerUser);
router.post('/login', loginUser);
router.get('/find/:userId', findUser);
router.get('/', getUsers);

module.exports = router;