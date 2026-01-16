import React, {useState} from "react"
import "./../Screens/Home/Home.css"

import {Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Flag, Calendar, Tag, Star} from "lucide-react"
import {BsPencilSquare } from 'react-icons/bs'     

import EditableField from "./EditableFIeld"


export default function TaskCard({todo, index, editingId, setEditingId, onToggleStar, onTaskDone, onEditTitleDesc, onToggleChecklistItem, 
    onTaskEdit, onDeleteTask}) {

    const [expandedChecklistId, setExpandedChecklistId] = useState(null)

    const getProgressPercentage = (task) => {
        if (!task.checklist || task.checklist.length === 0) return 0
        const completed = task.checklist.filter((item) => item.completed).length
        return Math.round((completed / task.checklist.length) * 100)
    }

    const showDate = (date) => {
        const day = date.getDate()
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString()
        return `${day}/${month}/${year}`
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
        case "high":
            return "#DD5746"
        case "medium":
            return "#FFC470"
        case "low":
            return "#4CAF50"
        default:
            return "#999"
        }
    }

    const progress = getProgressPercentage(todo)
    const taskColor = getPriorityColor(todo.priority)


    return (

        <div
            className="task"
            key={todo._id}
            style={{
                animationDelay: `${index * 0.1}s`,
                borderTopColor: taskColor,
            }}
        >
            <div className="task-header">
                <button
                    className={`star-button ${todo.starred ? "starred" : ""}`}
                    onClick={() => onToggleStar(todo._id)}
                    title="Star this task"
                >
                    <Star
                        size={20}
                        fill={todo.starred ? "currentColor" : "none"}
                    />
                </button>
            </div>

            <div className="task-top">
                <div className="checkbox">
                    {todo.done ? (
                        <CheckCircle2
                            className="check-icon"
                            onClick={(e) => onTaskDone(e, todo)}
                            size={20}
                        />
                    ) : (
                        <Circle
                            className="check-icon"
                            onClick={(e) => onTaskDone(e, todo)}
                            size={20}
                        />
                    )}
                    <div
                        className={`field ${
                            editingId.taskId === todo._id && editingId.title ? "editing" : ""
                        }`}
                    >
                        <EditableField
                            value={todo.title}
                            disabled={editingId.taskId !== todo._id && !editingId.title}
                            className={`todo-input ${todo.done && "crossed"}`}
                            onStartEdit={() => setEditingId(fields=> ({...fields, taskId: todo._id, title: true}))}
                            onStopEdit={() => setEditingId(fields=> ({...fields, taskId: null, title: false}))}
                            onBlur={(e) => onEditTitleDesc(e, todo, "title")}
                        />
                    </div>
                </div>
                <div className="task-actions">
                    <Trash2
                        className="trash"
                        size={18}
                        onClick={() => onDeleteTask(todo._id, todo.title, todo.isDemo)}
                    />
                </div>
            </div>

            {todo.desc && (
                <div
                    className={`field ${
                        editingId.taskId === todo._id && editingId.desc ? "editing" : ""
                    }`}
                >
                    <EditableField
                        value={todo.desc}
                        disabled={editingId.taskId !== todo._id && !editingId.desc}
                        className="description"
                        placeholder={
                            editingId === todo._id && !todo.desc
                                ? "Write Description (Optional)"
                                : ""
                        }
                        onStartEdit={() => setEditingId(fields=> ({...fields, taskId: todo._id, desc: true}))}
                        onStopEdit={() => setEditingId(fields=> ({...fields, taskId: null, desc: false}))}
                        onBlur={(e) =>onEditTitleDesc(e, todo, "desc")}
                    />
                </div>
            )}

            <div className="task-metadata">
                {todo.deadline && (
                    <div className="metadata-item deadline-badge">
                        <Calendar size={14} />
                        <span>{showDate(new Date(todo.deadline))}</span>
                    </div>
                )}
                {todo.priority && (
                    <div
                        className="metadata-item priority-badge"
                        style={{ borderColor: taskColor }}
                    >
                        <Flag size={14} fill={taskColor} color={taskColor} />
                        <span>{todo.priority}</span>
                    </div>
                )}
                {todo.tags && todo.tags.length > 0 && (
                    <div className="metadata-item tags-badge">
                        <Tag size={14} />
                        <span>{todo.tags.length}</span>
                    </div>
                )}
            </div>

            {todo.checklist && todo.checklist.length > 0 && (
                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-text">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {todo.checklist && todo.checklist.length > 0 && (
                <div className="checklist-section">
                    <button
                        className="checklist-toggle"
                        onClick={() =>
                            setExpandedChecklistId(
                                expandedChecklistId === todo._id
                                    ? null
                                    : todo._id
                            )
                        }
                    >
                        <span className="checklist-count">
                            {todo.checklist.filter((i) => i.completed).length}/
                            {todo.checklist.length} completed
                        </span>
                        {expandedChecklistId === todo._id ? (
                            <ChevronUp size={18} />
                        ) : (
                            <ChevronDown size={18} />
                        )}
                    </button>

                    {expandedChecklistId === todo._id && (
                        <div className="checklist-items-list">
                            {todo.checklist.map((item, idx) => (
                                <div key={idx} className="checklist-item-row">
                                    <button
                                        className={`checklist-checkbox ${
                                            item.completed ? "checked" : ""
                                        }`}
                                        onClick={() =>
                                            onToggleChecklistItem(todo._id, idx, item._id)
                                        }
                                    >
                                        {item.completed && <span>✓</span>}
                                    </button>
                                    <span
                                        className={`checklist-text ${
                                            item.completed ? "completed" : ""
                                        }`}
                                    >
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {todo.tags && todo.tags.length > 0 && (
                <div className="tags-display">
                    {todo.tags.map((tag, idx) => (
                        <span key={idx} className="tag-chip">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="task-bottom">
                <BsPencilSquare
                    className="full-editor"
                    size={15}
                    onClick={() => onTaskEdit(todo)}
                />
            </div>
        </div>
    )
}

