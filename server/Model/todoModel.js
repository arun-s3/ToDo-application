const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
    task: String,
    done:{type:Boolean,
        default:false}
});

const todoModel = mongoose.model("Todo", todoSchema);

module.exports = todoModel;