const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/todo-v2");
mongoose.connection.on("connected", ()=>console.log("Connected to database..."))
mongoose.connection.on("error", (error)=>console.log(error))
mongoose.connection.on("disconnected", ()=>console.log("Disconnected from the database..."))

app.use(express.json());

const cors = require('cors');
app.use(cors());

const todoModel = require('./Model/todoModel');

app.post('/add', (req,res)=>{
    const {title, desc, date} = req.body.task
    todoModel.create({title:title, desc:desc, date:date})
             .then(result=>res.json(result))
             .catch(error=>console.log(error))
})

app.get('/tasks', (req,res)=>{
    todoModel.find().then(result=> res.json(result))
                    .catch(error=>{console.log(error)})
})

app.put('/done/:id', (req,res)=>{
    const {id} = req.params
    todoModel.findByIdAndUpdate({_id:id},{done:req.body.done})
             .then(result=> res.json(result))
             .catch(error=> res.json(error))
})
app.put('/update/:id',(req,res)=> {
    const {id} = req.params
    req.body.title? todoModel.findByIdAndUpdate({_id:id},{title:req.body.title})
                             .then(result=> res.json(result))
                             .catch(error=> res.json(error))
                  : todoModel.findByIdAndUpdate({_id:id},{desc:req.body.desc})
                             .then(result=> res.json(result))
                             .catch(error=> res.json(error))
})
app.put('/done/:id', (req,res)=>{
    const {id} = req.params
    todoModel.FindByIdAndUpdate({_id:id},{done:req.body.done})
             .then(result=> res.json(result))
             .catch(error=> res.json(error))
})
app.delete('/delete/:id', (req,res)=>{
    const {id} = req.params
    todoModel.deleteOne({_id:id})
             .then(result=> res.json(result))
             .catch(error=> res.json(error))
})

app.listen('3001', ()=>{console.log("Server is running...")});

