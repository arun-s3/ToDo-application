const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
    title: String,
    done:{
        type:Boolean,
        default:false
    },
    desc:String,
    date:String
});

const todoModel = mongoose.model("Todo", todoSchema);

module.exports = todoModel;