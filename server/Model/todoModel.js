const mongoose = require('mongoose');


const checklistItemSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const todoSchema = mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    done: {
        type: Boolean,
        default: false
    },
    checklist: {
        type: [checklistItemSchema],
        default: []
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    deadline: {
        type: Date,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

todoSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const todoModel = mongoose.model("Todo", todoSchema);

module.exports = todoModel;