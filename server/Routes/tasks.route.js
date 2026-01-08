const express = require("express");
const router = express.Router();

const {createTodo, getAllTodos, updateTodoStatus, updateTodoContent, deleteTodo} = require("../Controllers/tasks.controller");


router.post("/", createTodo)
router.get("/", getAllTodos)
router.put("/update/:id", updateTodoContent)
router.patch("/done/:id", updateTodoStatus)
router.delete("/delete/:id", deleteTodo)

module.exports = router;
