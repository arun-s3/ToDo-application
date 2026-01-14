const Todo = require("../Model/todoModel")
const User = require("../Model/userModel")
const getUserIdentity = require("../Utils/userIdentity")

const { errorHandler } = require("../Middlewares/errorHandler")


const getTasksStats = async (req, res, next) => {
    try {
        console.log("Inside getTasksStats function")

        const { isGuest, userId, guestId } = getUserIdentity(req)

        const baseMatch = {
            isDemo: false, 
        }

        if (isGuest) {
            baseMatch.isGuest = true
            baseMatch.guestId = guestId
        } else {
            baseMatch.isGuest = false
            baseMatch.userId = userId
        }

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        const stats = await Todo.aggregate([
            { $match: baseMatch },

            {
                $facet: {
                    totalTasks: [{ $count: "count" }],

                    completedTasks: [{ $match: { done: true } }, { $count: "count" }],

                    pendingTasks: [{ $match: { done: false } }, { $count: "count" }],

                    highPriorityTasks: [{ $match: { priority: "high" } }, { $count: "count" }],

                    dueTodayTasks: [
                        {
                            $match: {
                                deadline: { $gte: todayStart, $lte: todayEnd },
                            },
                        },
                        { $count: "count" },
                    ],
                },
            },
        ])

        const result = stats[0]

        res.status(200).json({
            success: true,
            totalTasks: result.totalTasks[0]?.count || 0,
            completedTasks: result.completedTasks[0]?.count || 0,
            pendingTasks: result.pendingTasks[0]?.count || 0,
            highPriorityTasks: result.highPriorityTasks[0]?.count || 0,
            dueTodayTasks: result.dueTodayTasks[0]?.count || 0,
        })
    }
    catch (error) {
        console.error("Error fetching task stats:", error)
        next(error)
    }
}


const getProductivityTrend = async (req, res, next) => {
    try {
        const { isGuest, userId, guestId } = getUserIdentity(req)

        const baseMatch = {
            isDemo: false,
        }

        if (isGuest) {
            baseMatch.isGuest = true
            baseMatch.guestId = guestId
        } else {
            baseMatch.isGuest = false
            baseMatch.userId = userId
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 6)

        const data = await Todo.aggregate([
            {
                $match: {
                    ...baseMatch,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: ["$done", 1, 0] },
                    },
                },
            },
        ])

        const dataMap = {}
        data.forEach((d) => {
            dataMap[d._id] = {
                total: d.totalTasks,
                completed: d.completedTasks,
            }
        })

        const trend = []

        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate)
            day.setDate(startDate.getDate() + i)

            const key = day.toISOString().slice(0, 10)
            const label = day.toLocaleDateString("en-US", { weekday: "short" })

            const dayData = dataMap[key] || { total: 0, completed: 0 }

            const rate = dayData.total === 0 ? 0 : Math.round((dayData.completed / dayData.total) * 100)

            trend.push({
                day: label,
                rate,
                tasks: dayData.total,
            })
        }

        res.status(200).json({success: true, trend})
    }
    catch (error) {
        console.error("Error fetching productivity trend:", error)
        next(error)
    }
}


const getDeadlineInsights = async (req, res, next) => {
    try {
        const { isGuest, userId, guestId } = getUserIdentity(req)

        const baseMatch = {
            isDemo: false,
            deadline: { $ne: null },
        }

        if (isGuest) {
            baseMatch.isGuest = true
            baseMatch.guestId = guestId
        } else {
            baseMatch.isGuest = false
            baseMatch.userId = userId
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(today)
        const day = today.getDay()
        const daysLeft = 6 - day
        endOfWeek.setDate(today.getDate() + daysLeft)
        endOfWeek.setHours(23, 59, 59, 999)

        const data = await Todo.aggregate([
            { $match: baseMatch },
            {
                $project: {
                    bucket: {
                        $cond: [
                            { $lt: ["$deadline", today] },
                            "Overdue",
                            {
                                $cond: [{ $lte: ["$deadline", endOfWeek] }, "This Week", "Later"],
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$bucket",
                    count: { $sum: 1 },
                },
            },
        ])

        const result = {
            Overdue: 0,
            "This Week": 0,
            Later: 0,
        }

        data.forEach((d) => {
            result[d._id] = d.count
        })

        res.status(200).json({
            success: true,
            data: [
                {
                    Overdue: result.Overdue,
                    "This Week": result["This Week"],
                    Later: result.Later,
                },
            ],
        })
    } catch (error) {
        console.error("Deadline compliance error:", error)
        next(error)
    }
}



module.exports = { getTasksStats, getProductivityTrend, getDeadlineInsights }
