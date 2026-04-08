let jwt = require('jsonwebtoken')
let User = require('../schemas/userSchema')
module.exports = {
    checkLogin: async function (req, res, next) {
        console.log("HEADER:", req.headers.authorization);
        console.log("COOKIE:", req.cookies.token_login_tungNT);
        console.log("SECRET_KEY USED:", process.env.JWT_SECRET_KEY);

        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies.token_login_tungNT) {
            token = req.cookies.token_login_tungNT;
        }

        if (!token) {
            return res.status(403).json({ message: "ban chua dang nhap" });
        }

        try {
            let result = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (result.exp * 1000 > Date.now()) {
                let user = await User.findById(result.id || result._id);
                if (!user) {
                    return res.status(403).json({ message: "ban chua dang nhap" });
                } else {
                    req.user = user;
                    next();
                }
            } else {
                return res.status(403).json({ message: "ban chua dang nhap" });
            }
        } catch (error) {
            console.log('Auth error:', error);
            return res.status(403).json({ message: "ban chua dang nhap" });
        }

    },
    CheckPermission: function (...requiredRole) {
        return function (req, res, next) {
            let role = req.user.role.name;
            console.log(role);
            if (requiredRole.includes(role)) {
                next();
            } else {
                res.status(403).send("ban khong co quyen")
            }
        }
    }
}