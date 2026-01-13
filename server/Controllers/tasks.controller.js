const Todo = require("../Model/todoModel")
const User = require("../Model/userModel")
const getUserIdentity = require("../Utils/userIdentity")

const {errorHandler} = require("../Middlewares/errorHandler")


const createTodo = async (req, res, next) => {
    try {
        console.log("Inside createTodo")

        const { isGuest, userId, guestId } = getUserIdentity(req)

        console.log("req.body.task --->", JSON.stringify(req.body.task))

        const {
          title,
          desc,
          checklist = [],
          priority = "medium",
          deadline = null,
          tags = [],
          starred = false,
          isDemo = false
        } = req.body.task

        if (!title || !title.trim()) {
          return next(errorHandler(400, "Title is required"))
        }

        const todoData = {
          isGuest,
          title: title.trim(),
          desc,
          checklist,
          priority,
          deadline,
          tags,
          starred,
          isDemo
        }

        if (isGuest){
          todoData.guestId = guestId
        }else{
          todoData.userId = userId
        }

        const todo = await Todo.create(todoData)

        if (!isDemo) {
            if (isGuest) {
              await Todo.deleteMany({isGuest: true, guestId, isDemo: true})
            }else {
              await User.updateOne({ _id: userId }, { hasSeenDemoTask: true})
          
              await Todo.deleteMany({isGuest: false, userId, isDemo: true})
            }
        }else{
            const existingDemo = await Todo.findOne({
                isDemo: true,
                ...(isGuest ? { guestId } : { userId }),
            }) 
            if (existingDemo) {
                return res.status(200).json({ success: true, data: existingDemo, message: "Demo already exists"})
            }
        }

        return res.status(201).json({success: true, data: todo})
    }
    catch (error) {
        console.error("Error creating todo:", error.message)
        next(error)
    }
}


const migrateGuestTodos = async (req, res, next) => {
    try {
        console.log("Migrating guest todos...")

        const { guestId, hasSeenDemoTask } = req.body
        const userId = req.user._id

        if (!guestId) {
            return next(errorHandler(400, "Guest ID missing"))
        }

        if (hasSeenDemoTask === true) {
            await User.updateOne({ _id: userId }, { $set: { hasSeenDemoTask: true } })
        }

        const guestTodos = await Todo.find({ isGuest: true, guestId })

        if (!guestTodos.length) {
            return res
                .status(200)
                .json({ success: true, message: "No guest todos to migrate" })
        }

        if (hasSeenDemoTask === true) {
            await Todo.deleteOne({ isGuest: true, guestId, isDemo: true })
        }

        await Todo.updateMany(
            { isGuest: true, guestId },
            {
                $set: {
                    isGuest: false,
                    userId: userId,
                },
                $unset: {
                    guestId: "",
                },
            }
        );

        return res.status(200).json({success: true, message: "Guest todos migrated successfully"});
    } catch (error) {
        console.error("Migration error:", error.message)
        next(error)
    }
}


const getAllTodos = async (req, res, next) => {
    try {
        console.log("Getting all tasks..")

        const { isGuest, userId, guestId } = getUserIdentity(req)

        console.log("req.body.taskQueryOptions --->", JSON.stringify(req.body.taskQueryOptions))

        const {
            type = "all",
            sortBy = "created",
            sort = -1,
            search = "",
            page = 1,
            limit = 5,
        } = req.body.taskQueryOptions || {}

        const query = {}

        if (isGuest) {
            query.isGuest = true
            query.guestId = guestId
        } else {
            query.isGuest = false
            query.userId = userId
        }

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        switch (type) {
            case "pending":
                query.done = false
                break
            case "completed":
                query.done = true
                break
            case "dueToday":
                query.deadline = { $gte: todayStart, $lte: todayEnd }
                break
            case "highPriority":
                query.priority = "high"
                break
            case "all":
            default:
                break
        }

        if (search && search.trim()) {
            const regex = new RegExp(search, "i")
            query.$or = [{ title: regex }, { desc: regex }, { tags: regex }]
        }

        const sortMap = {
            priority: "priorityRank",
            starred: "starred",
            deadline: "deadline",
            created: "createdAt",
        }

        const sortField = sortMap[sortBy] || "createdAt"

        const sortObj = {
            [sortField]: sort,
            _id: -1,
        }

        const skip = (page - 1) * limit

        const total = await Todo.countDocuments(query)

        const todos = await Todo.find(query).sort(sortObj).skip(skip).limit(limit)

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
            todos,
        })
    } catch (error) {
        console.error("Error fetching todos:", error.message)
        next(error)
    }
}


const updateTodoStatus = async (req, res, next) => {
    try {
        console.log("Inside updateTodoStatus controller")

        const { id } = req.params
        const { done } = req.body

        console.log("done--->", done)

        if (typeof done !== "boolean") {
            return next(errorHandler(400, "Invalid done value"))
        }

        const updatedTodo = await Todo.findByIdAndUpdate(id, { done }, { new: true })

        if (!updatedTodo) {
            return next(errorHandler(404, "Todo not found"))
        }

        return res.status(200).json({success: true, data: updatedTodo});
    }
    catch (error) {
        console.error("Error updating todo status:", error.message)
        next(error)
    }
}


const updateTodoContent = async (req, res, next) => {
    try {
        console.log("Inside updateTodoContent")

        const { isGuest, userId, guestId } = getUserIdentity(req)
        const { id } = req.params
        const updates = req.body.task

        console.log("updates--->", JSON.stringify(updates))

        if (!updates || Object.keys(updates).length === 0) {
            return next(errorHandler(400, "Nothing to update"))
        }

        const todo = await Todo.findById(id)
        if (!todo) {
            return next(errorHandler(404, "Todo not found"))
        }

        if (todo.isGuest) {
            if (!isGuest || todo.guestId !== guestId) {
                return next(
                    errorHandler(403, "Not authorized to update this todo")
                )
            }
        } else {
            if (isGuest || todo.userId.toString() !== userId.toString()) {
                return next(
                    errorHandler(403, "Not authorized to update this todo")
                )
            }
        }

        const allowedFields = [
            "title",
            "desc",
            "done",
            "checklist",
            "priority",
            "deadline",
            "tags",
            "starred",
        ]

        allowedFields.forEach((field) => {
            if (updates[field] !== undefined) {
                todo[field] = updates[field]
            }
        })

        const updatedTodo = await todo.save()

        return res.status(200).json({success: true, data: updatedTodo})
    }
    catch (error) {
        console.error("Error updating todo:", error.message)
        next(error)
    }
}


const toggleChecklistItem = async (req, res, next) => {
    try {
        console.log("Inside toggleChecklistItem")

        const { isGuest, userId, guestId } = getUserIdentity(req)
        const { todoId, itemId } = req.params

        const todo = await Todo.findById(todoId)
        if (!todo) {
            return next(errorHandler(404, "Todo not found"))
        }

        if (todo.isGuest) {
            if (!isGuest || todo.guestId !== guestId) {
                return next(errorHandler(403, "Not authorized"))
            }
        } else {
            if (isGuest || todo.userId.toString() !== userId.toString()) {
                return next(errorHandler(403, "Not authorized"))
            }
        }

        const item = todo.checklist.id(itemId)
        if (!item) {
            return next(errorHandler(404, "Checklist item not found"))
        }

        item.completed = !item.completed

        await todo.save()

        return res.status(200).json({success: true})
    } 
    catch (error) {
        console.error("Checklist toggle error:", error.message)
        next(error)
    }
}


const toggleStar = async (req, res, next) => {
    try {
        const { todoId } = req.params

        const { isGuest, userId, guestId } = getUserIdentity(req)

        const filter = { _id: todoId }

        if (isGuest) {
            filter.guestId = guestId
            filter.isGuest = true
        } else {
            filter.userId = userId
            filter.isGuest = false
        }

        const todo = await Todo.findOne(filter)

        if (!todo) {
            return next(errorHandler(404, "Todo not found"))
        }

        todo.starred = !todo.starred
        await todo.save()

        res.status(200).json({success: true,  starred: todo.starred})
    }
    catch (error) {
        console.error("Error toggling star:", error.message)
        next(error)
    }
}


const deleteTodo = async (req, res, next) => {
    try {
        console.log("Inside deleteTodo controller")

        const { id } = req.params

        const todo = await Todo.findById(id)
        if (!todo) {
            return next(errorHandler(404, "Todo not found"))
        }

        if (todo.isDemo) {
            if (!isGuest) {
                await User.updateOne({ _id: userId }, { hasSeenDemoTask: true })
            }
        }

        await Todo.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Todo deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting todo:", error.message)
        next(error)
    }
}



module.exports = {createTodo, migrateGuestTodos, getAllTodos, updateTodoStatus, updateTodoContent, toggleChecklistItem, 
    toggleStar, deleteTodo}
