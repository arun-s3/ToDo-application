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
    isGuest: {
        type: Boolean,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function () {
            return this.isGuest === false
        },
    },
    guestId: {
        type: String,
        required: function () {
            return this.isGuest === true
        },
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    desc: {
        type: String,
        trim: true,
    },
    done: {
        type: Boolean,
        default: false,
    },
    checklist: {
        type: [checklistItemSchema],
        default: [],
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    priorityRank: {
      type: Number,
      default: 2
    },
    deadline: {
        type: Date,
        default: null,
    },
    starred: {
        type: Boolean,
        default: false,
    },
    tags: {
        type: [String],
        default: [],
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

todoSchema.index(
  { userId: 1, isDemo: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDemo: true,
      isGuest: false,
    },
  }
)

todoSchema.index(
  { guestId: 1, isDemo: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDemo: true,
      isGuest: true,
    },
  }
)


todoSchema.pre("save", function (next) {
    this.updatedAt = Date.now();

    this.priorityRank = this.priority === "high" ? 3 : this.priority === "medium" ? 2 : 1
    this.updatedAt = Date.now()

    next();
});

const todoModel = mongoose.model("Todo", todoSchema);

module.exports = todoModel;