const express = require("express");
const taskRouter = express.Router();
const {isLogin, isLogout} = require('../Middlewares/authentication')

const {createTodo, migrateGuestTodos, getAllTodos, updateTodoStatus, updateTodoContent, toggleChecklistItem, toggleStar,
    deleteTodo, removeDuplicateDemoTasks} = require("../Controllers/tasks.controller")


taskRouter.post("/add", isLogin, createTodo)
taskRouter.post("/", isLogin, getAllTodos)
taskRouter.put("/update/:id", isLogin, updateTodoContent) , 
taskRouter.patch("/:todoId/checklist/:itemId/toggle", isLogin, toggleChecklistItem)
taskRouter.patch("/:todoId/star/toggle", isLogin, toggleStar)
taskRouter.patch("/done/:id", isLogin, updateTodoStatus) 
taskRouter.delete("/delete/:id", isLogin, deleteTodo)
taskRouter.delete("demo/delete", isLogin, removeDuplicateDemoTasks)
taskRouter.post("/migrate-guest", isLogin, migrateGuestTodos)


module.exports = taskRouter;
