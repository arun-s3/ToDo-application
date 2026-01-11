const express = require("express");
const taskRouter = express.Router();
const {isLogin, isLogout} = require('../Middlewares/authentication')

const {createTodo, migrateGuestTodos, getAllTodos, updateTodoStatus, updateTodoContent, 
    deleteTodo} = require("../Controllers/tasks.controller")


taskRouter.post("/add", isLogin, createTodo)
taskRouter.get("/", getAllTodos)
taskRouter.put("/update/:id", updateTodoContent)
taskRouter.patch("/done/:id", updateTodoStatus)
taskRouter.delete("/delete/:id", deleteTodo)
taskRouter.post("/migrate-guest", isLogin, migrateGuestTodos)


module.exports = taskRouter;
