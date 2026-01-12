import React, { useState, useRef } from "react"
import "./CreateTask.css"

import { api } from "../api/axiosInstance"
import { Plus, X, ListTodo, Flag, Calendar, Tag } from "lucide-react"
import { toast } from 'sonner'

import ModalPortal from "../ModalPortal"
import { useEffect } from "react"

function CreateTask({ onsubmit, editTask, onUpdateSuccess, isModalOpen, onModalClose }) {

    const [task, setTask] = useState({
        title: "",
        desc: "",
        date: new Date(),
        priority: "medium",
        deadline: null,
        checklist: [],
        tags: [],
        starred: false,
    })

    const [checklistInput, setChecklistInput] = useState("")
    const [tagInput, setTagInput] = useState("")

    const titleRef = useRef(null)
    const descriptionRef = useRef(null)

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onModalClose()
        }

        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [])

    useEffect(() => {
        if(editTask){
            setTask(editTask)
        }
    }, [editTask])

    useEffect(() => {
        console.log("task---->", task)
    }, [task])

    const addNewTask = ()=> {
        api.post(`tasks/add`, { task })
            .then((result) => {
                console.log(result)
                resetForm()
                onsubmit()
            })
            .catch((error) => {
                toast.error(error.response.data.message)
                console.log("Error---->", error.response.data.message)
            })
    }

    const UpdateTask = () => {
        console.log("Submiting updated task---->", task)
        api.put(`tasks/update/${task._id}`, { task })
            .then((result) => {
                console.log(result)
                onUpdateSuccess(task)
                resetForm()
            })
            .catch((error) => {
                toast.error(error.response.data.message)
                console.log("Error---->", error.response.data.message)
            })
    }

    const handleSubmit = () => {
        if (!task.title.trim()) {
            alert("Please enter a task title")
            return
        }
        if(editTask){
            UpdateTask()
        }else{
            addNewTask()
        }
    }

    const resetForm = () => {
        setTask({
            title: "",
            desc: "",
            date: new Date(),
            priority: "medium",
            deadline: null,
            checklist: [],
            tags: [],
            starred: false,
        })
        onModalClose()
        setChecklistInput("")
        setTagInput("")
    }

    const addChecklistItem = () => {
        if (checklistInput.trim()) {
            setTask({
                ...task,
                checklist: [
                    ...task.checklist,
                    { text: checklistInput, completed: false },
                ],
            })
            setChecklistInput("")
        }
    }

    const removeChecklistItem = (index) => {
        setTask({
            ...task,
            checklist: task.checklist.filter((_, i) => i !== index),
        })
    }

    const addTag = () => {
        if (tagInput.trim() && !task.tags.includes(tagInput.trim())) {
            setTask({
                ...task,
                tags: [...task.tags, tagInput.trim()],
            })
            setTagInput("")
        }
    }

    const removeTag = (index) => {
        setTask({
            ...task,
            tags: task.tags.filter((_, i) => i !== index),
        })
    }

    return (
        <div className="task-creater">
            {isModalOpen && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={onModalClose}>
                        <div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3> {editTask ? "Update Your Task" : "Create New Task"} </h3>
                                <button
                                    className="modal-close"
                                    onClick={onModalClose}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="modal-section">
                                    <label className="section-label">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter task title"
                                        ref={titleRef}
                                        value={task.title}
                                        onChange={(e) =>
                                            setTask({
                                                ...task,
                                                title: e.target.value,
                                            })
                                        }
                                        className="title-input"
                                        autoFocus
                                    />
                                </div>

                                <div className="modal-section">
                                    <label className="section-label">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Enter description (Optional)"
                                        maxLength="500"
                                        rows={4}
                                        ref={descriptionRef}
                                        value={task.desc}
                                        onChange={(e) =>
                                            setTask({
                                                ...task,
                                                desc: e.target.value,
                                            })
                                        }
                                        className="description-input"
                                    />
                                </div>

                                <div className="modal-section">
                                    <label className="section-label">
                                        <Flag size={18} />
                                        Priority
                                    </label>
                                    <div className="priority-options">
                                        {["low", "medium", "high"].map((p) => (
                                            <button
                                                key={p}
                                                className={`priority-btn ${
                                                    task.priority === p
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setTask({
                                                        ...task,
                                                        priority: p,
                                                    })
                                                }
                                            >
                                                {p.charAt(0).toUpperCase() +
                                                    p.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-section">
                                    <label className="section-label">
                                        <Calendar size={18} />
                                        Deadline
                                    </label>
                                    <input
                                        type="date"
                                        className="deadline-input"
                                        value={
                                            task.deadline
                                                ? task.deadline.split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setTask({
                                                ...task,
                                                deadline: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="modal-section">
                                    <label className="section-label">
                                        <ListTodo size={18} />
                                        Checklist Items
                                    </label>
                                    <div className="checklist-input-group">
                                        <input
                                            type="text"
                                            placeholder="Add checklist items..."
                                            value={checklistInput}
                                            onChange={(e) =>
                                                setChecklistInput(
                                                    e.target.value
                                                )
                                            }
                                            onKeyPress={(e) =>
                                                e.key === "Enter" &&
                                                addChecklistItem()
                                            }
                                            className="checklist-input"
                                        />
                                        <button
                                            className="btn-add-item"
                                            onClick={addChecklistItem}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="checklist-items">
                                        {task.checklist.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="checklist-item"
                                            >
                                                <span>{item.text}</span>
                                                <button
                                                    className="btn-remove"
                                                    onClick={() =>
                                                        removeChecklistItem(idx)
                                                    }
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-section">
                                    <label className="section-label">
                                        <Tag size={18} />
                                        Tags
                                    </label>
                                    <div className="tag-input-group">
                                        <input
                                            type="text"
                                            placeholder="Add necessary tags..."
                                            value={tagInput}
                                            onChange={(e) =>
                                                setTagInput(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === "Enter" && addTag()
                                            }
                                            className="tag-input"
                                        />
                                        <button
                                            className="btn-add-item"
                                            onClick={addTag}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="tags-list">
                                        {task.tags.map((tag, idx) => (
                                            <div
                                                key={idx}
                                                className="tag-badge"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    className="tag-remove"
                                                    onClick={() =>
                                                        removeTag(idx)
                                                    }
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn-modal-cancel"
                                    onClick={onModalClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-modal-save"
                                    onClick={handleSubmit}
                                >
                                    {editTask ? "Update Task" : "Create Task"}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    )
}

export default CreateTask
