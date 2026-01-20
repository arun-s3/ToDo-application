const User = require("../Model/userModel")
const bcrypt = require("bcryptjs")
const { generateToken } = require("../Utils/jwt")

const { errorHandler } = require("../Middlewares/errorHandler")


const signupUser = async (req, res, next)=> {
    try {
        console.log("Inside signupUser")
        console.log("req.body.userDetails --->", JSON.stringify(req.body.userDetails))
        const { username, password } = req.body.userDetails 

        if (!username || !password)
          return next(errorHandler(400, "Username and password required"))   

        const exists = await User.findOne({ username })
        if (exists) return next(errorHandler(409, "Username already taken")) 

        const user = await User.create({ username, password })   

        generateToken(res, user._id)

        res.status(201).json({
          success: true,
          user: {
            _id: user._id,
            username: user.username,
          }
        })
    }
    catch (error) {
        console.error("Error during sign up:", error.message)
        next(error)
    }
}


const loginUser = async (req, res, next) => {
    try {
        console.log("Inside loginUser")
        console.log("req.body.userDetails --->", JSON.stringify(req.body.userDetails))
        const { username, password } = req.body.userDetails 

        const user = await User.findOne({ username }).select("+password")
        if (!user)
          return next(errorHandler(401, "Invalid credentials. Please sign up first!"))

        const match = await bcrypt.compare(password, user.password)
        if (!match)
          return next(errorHandler(401, "Invalid credentials"))

        generateToken(res, user._id)

        res.status(200).json({
          success: true,
          user: {
            _id: user._id,
            username: user.username,
          }
        })
    }
    catch (error) {
        console.error("Error during sign in:", error.message)
        next(error)
    }
}


const getCurrentUser = async (req, res, next) => {
    try {
        console.log("Inside getCurrentUser")
        if (!req.user){
          return next(errorHandler(401, "Not authenticated"))
        }

        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                username: req.user.username,
                hasSeenDemoTask: req.user.hasSeenDemoTask,
            },
        })
    }
  catch (error) {
        console.error("Error while checking the user:", error.message)
        next(error)
  }
}


const logoutUser = (req, res, next) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })

        res.status(200).json({success: true, message: "Logged out successfully"})
    }
    catch (error) {
        console.error("Logout error:", error.message)
        next(error)
  }
}



module.exports = {signupUser, loginUser, getCurrentUser, logoutUser}