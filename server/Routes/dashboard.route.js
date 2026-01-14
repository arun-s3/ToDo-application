const express = require("express")
const dashboardRouter = express.Router()
const { isLogin, isLogout } = require("../Middlewares/authentication")

const { getTasksStats, getProductivityTrend, getDeadlineInsights } = require("../Controllers/dashboard.controller")


dashboardRouter.get("/stats", isLogin, getTasksStats)
dashboardRouter.get("/trend", isLogin, getProductivityTrend)
dashboardRouter.get("/deadline-insights", isLogin, getDeadlineInsights)


module.exports = dashboardRouter
