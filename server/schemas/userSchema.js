const mongoose = require('mongoose');
let bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 3,
            maxlength: 1024,
        },
        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
        {
            timestamps: true
        },
    
)
userSchema.pre('save', async function () {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});
userSchema.pre('findOneAndUpdate', function () {
    if (this._update.password) {
        let salt = bcrypt.genSaltSync(10);
        //console.log(this._update.password);
        this._update.password = bcrypt.hashSync(this._update.password, salt);
    }
});

module.exports = mongoose.model("user", userSchema);