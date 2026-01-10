const {verifyToken} = require('../Utils/jwt')
const User = require('../Model/userModel')


const isLogin = async (req, res, next) => {
    try {
        if (req.cookies.jwt){
            const token = req.cookies.jwt;
            const decoded = verifyToken(token)
            if (!decoded) return res.status(401).json({ message: "Unauthorized" })

            const user = await User.findById(decoded.userId).select("-password")
            if (!user) return res.status(401).json({ message: "Unauthorized" })

            req.user = user;
            next();
        }else if (req.headers["x-guest-id"]){
            req.isGuest = true
            req.guestId = req.headers["x-guest-id"]
            next()
        }else{
            return res.status(401).json({ message: "No identity" });
        }
    }
    catch (error) {
        next(error)
    }
}

const isLogout = (req, res, next) => {
  if (!req.cookies.jwt) return next();
  res.status(400).json({ message: "Already logged in" })
}


module.exports = {isLogin, isLogout}