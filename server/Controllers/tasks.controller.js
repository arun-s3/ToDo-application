const Todo = require("../Model/todoModel")
const {errorHandler} = require("../Middlewares/errorHandler")


const createTodo = async (req, res, next) => {
    try {
        console.log("Inside createTodo controller")

        const { title, desc, date } = req.body.task;

        if (!title) {
            return next(errorHandler(400, "Title is required"))
        }

        const todo = await Todo.create({title, desc, date})

        return res.status(201).json({success: true,  data: todo});
    }
    catch (error) {
        console.error("Error creating todo:", error.message)
        next(error)
    }
}


const getAllTodos = async (req, res, next) => {
    try {
        console.log("Inside getAllTodos controller")

        const todos = await Todo.find().sort({ createdAt: -1 })
        
        console.log("todos--->", JSON.stringify(todos))

        return res.status(200).json({success: true, count: todos.length, todos});
    }
    catch (error) {
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
        console.log("Inside updateTodoContent controller")

        const { id } = req.params
        const { title, desc } = req.body

        if (!title && !desc) {
            return next(errorHandler(400, "Nothing to update"))
        }

        const updatePayload = {}
        if (title) updatePayload.title = title
        if (desc) updatePayload.desc = desc

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return next(errorHandler(404, "Todo not found"))
        }

        return res.status(200).json({success: true, data: updatedTodo});
    }
    catch (error) {
        console.error("Error updating todo content:", error.message)
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




module.exports = {createTodo, getAllTodos, updateTodoStatus, updateTodoContent, deleteTodo};
