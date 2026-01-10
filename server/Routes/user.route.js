const express = require("express");
const authRouter = express.Router();
const {isLogin, isLogout} = require('../Middlewares/authentication')

const {signupUser, loginUser, getCurrentUser, logoutUser} = require("../Controllers/auth.controller");


authRouter.post("/signup", isLogout, signupUser)
authRouter.post("/signin", isLogout, loginUser)
authRouter.get("/user", isLogin, getCurrentUser)
authRouter.get("/signout", isLogin, logoutUser)


module.exports = authRouter;
