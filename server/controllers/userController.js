const userSchema = require('../schemas/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const createToken = (_id) => {
    const jwtkey= process.env.JWT_SECRET_KEY;
    console.log('TOKEN CREATED WITH SECRET:', jwtkey ? jwtkey.substring(0, 20) + '...' : 'UNDEFINED');
    return jwt.sign({id: _id}, jwtkey, { expiresIn: '1d' });
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await userSchema.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
            }
        if(!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        user= new userSchema({username, email, password});
        await user.save();

        const token = createToken(user._id);
        res.status(200).json({_id: user._id, username, email, token})
    }catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try{
        let user = await userSchema.findOne({ email });
        if (!user || user.isDeleted) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = createToken(user._id);
        res.status(200).json({_id: user._id, username: user.username, email, token});

    }catch(error){
        console.log(error)
    }
};
const SuccessLogin= async function (user) {
        user.loginCount = 0;
        await user.save()
    };

const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userSchema.findById(userId);
        if (!user || user.isDeleted) {
             return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);

    }catch(error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const user = await userSchema.find({ isDeleted: { $ne: true } });
        res.status(200).json(user);

    }catch(error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUserFriends = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userSchema.findById(userId).populate('friends', 'username email avatar isDeleted');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Lọc những người bạn chưa bị xóa mềm
        const activeFriends = user.friends.filter(friend => !friend.isDeleted);
        res.status(200).json(activeFriends);
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    findUser,
    SuccessLogin,
    getUsers,
    getUserFriends
};