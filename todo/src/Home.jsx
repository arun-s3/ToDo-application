import React, { useState, useEffect, useRef } from "react"
import "./Home.css"

import { api } from "./api/apiInstance"
import { toast } from 'sonner'
import {Trash2, Edit2, CheckCircle2, Circle, ChevronDown, ChevronUp, Flag, Calendar, Tag, Star, Search, Plus,
  ClipboardList, SquareCheck, Clock, Zap
} from "lucide-react"

import Create from "./Create"


function Home({ activeTab = "all" }) {

  const [todos, setTodo] = useState([])
  const [fetchTasks, setFetchTasks] = useState(false)

  const [editingId, setEditingId] = useState(null)

  const [expandedChecklistId, setExpandedChecklistId] = useState(null)

  const [sortBy, setSortBy] = useState("date-desc")

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const [showModal, setShowModal] = useState(false)

  const [showCompleted, setShowCompleted] = useState(true)

  const descRef = useRef(null)
  const titleRef = useRef(null)

  const getTasks = () => {
    api.get('/tasks')
        .then(result=> {
                console.log("result.data--->", result.data.todos)
                setTodo(result.data.todos)
        })
        .catch((error) => toast.error(error.response.data.message || "Something went wrong. Check your network!"))
  }

  useEffect(() => {
    getTasks()
  }, [])

  useEffect(() => {
    if (fetchTasks) {
      getTasks()
      setFetchTasks(false)
    }
  }, [fetchTasks])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setShowSearchResults(false)
      setSearchResults([])
      return
    }

    const filtered = todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query.toLowerCase()) ||
        todo.desc?.toLowerCase().includes(query.toLowerCase()) ||
        todo.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
    )

    setSearchResults(sortTasks(filtered))
    setShowSearchResults(true)
  }

  const getFilteredTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filtered = todos

    switch (activeTab) {
      case "pending":
        filtered = todos.filter((t) => !t.done)
        break
      case "completed":
        filtered = todos.filter((t) => t.done)
        break
      case "today":
        filtered = todos.filter((t) => {
          const taskDate = new Date(t.date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate.getTime() === today.getTime()
        })
        break
      case "high-priority":
        filtered = todos.filter((t) => t.priority === "high" && !t.done)
        break
      default:
        filtered = todos
    }

    if (!showCompleted) {
      filtered = filtered.filter((t) => !t.done)
    }

    return sortTasks(filtered)
  }

    const toggleDoneHandler = (e, currentTodo) => {
        e.stopPropagation()
        const newDone = !currentTodo.done
        api.patch(`tasks/done/${currentTodo._id}`, { done: newDone })
            .then(result=> {
                if(result){
                    console.log(result)
                    const newTodos = todos.map(todo=> {
                        if(todo._id === currentTodo._id){
                            todo.done = newDone
                        }
                        return todo
                    })
                    setTodo(newTodos)
                }
            })
            .catch(error=> {
                    toast.error(error.response.data.message)
                    console.log("Error---->", error.response.data.message)
             })
    }

    const handleTrash = (id)=>{
        api.delete(`tasks/delete/${id}`)
             .then(result=> console.log(result))
             .catch(error=> {
                    toast.error(error.response.data.message)
                    console.log("Error---->", error.response.data.message)
             })
        const newTodos = todos.filter(todo=> todo._id !== id)
        setTodo(newTodos)
    }

    const initiateEditing = (id) => {
        setEditingId(id)
        titleRef.current?.focus()
    }

    const handleEditTitle = (e, currentTodo)=> {
        const title = e.target.value
        console.log("title--->", title)
        e.target.style.borderBottom = ""
        api.put(`tasks/update/${currentTodo._id}`, {title:title})
            .then(result=> {
                if(result){
                    console.log(result)
                    const newTodos = todos.map(todo=> {
                        if(todo._id === currentTodo._id){
                            todo.title = title
                        }
                        return todo
                    })
                    setTodo(newTodos)
                }
             })
            .catch(error=> {
                    toast.error(error.response.data.message)
                    console.log("Error---->", error.response.data.message)
             })
        descRef.current.focus()
    }
  
    const handleEditDescription = (e, currentTodo)=> {
        const desc = e.target.value
        e.target.style.borderBottom = ""
        e.target.placeholder = ""
        api.put(`tasks/update/${currentTodo._id}`, {desc:desc})
            .then(result=> {
                if(result){
                    console.log(result)
                    const newTodos = todos.map(todo=> {
                        if(todo._id === currentTodo._id){
                            todo.desc = desc
                        }
                        return todo
                    })
                    setTodo(newTodos)
                }
            })
            .catch(error=> {
                    toast.error(error.response.data.message)
                    console.log("Error---->", error.response.data.message)
             })
        setEditingId(null)
    }

  const toggleChecklistItem = (taskId, itemIndex) => {
    const updatedTodos = todos.map((todo) => {
      if (todo._id === taskId) {
        const updatedChecklist = [...todo.checklist]
        updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed
        // api
        //   .put("http://localhost:3001/update/" + taskId, {
        //     checklist: updatedChecklist,
        //   })
        //   .catch((error) => console.log(error))
        return { ...todo, checklist: updatedChecklist }
      }
      return todo
    })
    setTodo(updatedTodos)
  }

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

  const handleToggleStar = (taskId) => {
    const updatedTodos = todos.map((todo) => {
      if (todo._id === taskId) {
        const newStarred = !todo.starred
        // api
        //   .put("http://localhost:3001/update/" + taskId, { starred: newStarred })
        //   .catch((error) => console.log(error))
        return { ...todo, starred: newStarred }
      }
      return todo
    })
    setTodo(updatedTodos)
  }

  const sortTasks = (tasksToSort) => {
    const sorted = [...tasksToSort]

    switch (sortBy) {
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
      case "date-old":
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
      case "priority-low":
        const priorityOrder = { low: 1, medium: 2, high: 3 }
        return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      case "priority-high":
        const priorityOrderDesc = { high: 1, medium: 2, low: 3 }
        return sorted.sort((a, b) => priorityOrderDesc[a.priority] - priorityOrderDesc[b.priority])
      case "starred":
        return sorted.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
      case "created":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case "deadline":
        return sorted.sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline) - new Date(b.deadline)
        })
      case "deadline-latest":
        return sorted.sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(b.deadline) - new Date(a.deadline)
        })
      default:
        return sorted
    }
  }

  const filteredTodos = getFilteredTasks()

  const renderTaskCard = (todo, index) => {
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
        onMouseLeave={() => {
          if (editingId) {
            setEditingId(null)
          }
        }}
      >
        <div className="task-header">
          <button
            className={`star-button ${todo.starred ? "starred" : ""}`}
            onClick={() => handleToggleStar(todo._id)}
            title="Star this task"
          >
            <Star size={20} fill={todo.starred ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="task-top">
          <div className="checkbox">
            {todo.done ? (
              <CheckCircle2 className="check-icon" onClick={(e) => toggleDoneHandler(e, todo)} size={20} />
            ) : (
              <Circle className="check-icon" onClick={(e) => toggleDoneHandler(e, todo)} size={20} />
            )}
            <div className={`field ${editingId === todo._id ? "editing" : ""}`}>
              <input
                type="text"
                disabled={editingId !== todo._id}
                className={todo.done ? "crossed todo" : "todo"}
                defaultValue={todo.title}
                ref={titleRef}
                onBlur={(e) => handleEditTitle(e, todo)}
              />
            </div>
          </div>
          <div className="task-actions">
            <Trash2 className="trash" size={18} onClick={() => handleTrash(todo._id)} />
          </div>
        </div>

        {todo.desc && (
          <div className={`field ${editingId === todo._id ? "editing" : ""}`}>
            <textarea
              className="description"
              defaultValue={todo.desc}
              ref={descRef}
              disabled={editingId !== todo._id}
              placeholder={editingId === todo._id && !todo.desc ? "Write Description (Optional)" : ""}
              onBlur={(e) => handleEditDescription(e, todo)}
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
            <div className="metadata-item priority-badge" style={{ borderColor: taskColor }}>
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
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {todo.checklist && todo.checklist.length > 0 && (
          <div className="checklist-section">
            <button
              className="checklist-toggle"
              onClick={() => setExpandedChecklistId(expandedChecklistId === todo._id ? null : todo._id)}
            >
              <span className="checklist-count">
                {todo.checklist.filter((i) => i.completed).length}/{todo.checklist.length} completed
              </span>
              {expandedChecklistId === todo._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedChecklistId === todo._id && (
              <div className="checklist-items-list">
                {todo.checklist.map((item, idx) => (
                  <div key={idx} className="checklist-item-row">
                    <button
                      className={`checklist-checkbox ${item.completed ? "checked" : ""}`}
                      onClick={() => toggleChecklistItem(todo._id, idx)}
                    >
                      {item.completed && <span>✓</span>}
                    </button>
                    <span className={`checklist-text ${item.completed ? "completed" : ""}`}>{item.text}</span>
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
          <Edit2 className="editor" size={18} onClick={() => initiateEditing(todo._id)} />
        </div>
      </div>
    )
  }

  const getTabLabel = () => {
    const labels = {
      all: "All Tasks",
      pending: "Pending Tasks",
      completed: "Completed Tasks",
      today: "Due Today's Task",
      "high-priority": "High Priority Tasks",
    }
    return labels[activeTab] || "All Tasks"
  }

  const getTabSubtitle = () => {
    const labels = {
      all: "View all your tasks in one place",
      pending: "Tasks that are still waiting for your action",
      completed: "Tasks you have finished and marked as done",
      today: "Tasks that are scheduled to be completed today",
      "high-priority": "Critical tasks that require your immediate attention",
    }
    return labels[activeTab] 
  }

  const getTabIcon = () => {
    const labels = { 
      all: ClipboardList,
      pending: Clock,
      completed: SquareCheck,
      today: Calendar,
      "high-priority": Zap,
    }
    const Icon = labels[activeTab] 
    return <Icon />
  }


  return (
    <div className={`home`}>
      <div className="home-header">
        <div className="tab-wrapper">
          <i className="icon">{getTabIcon()}</i>
          <h2 className="title">{getTabLabel()}</h2>
        </div>
          <p className="subtitle">{getTabSubtitle()}</p>
      </div>

      <div className="search-and-add-wrapper">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <button className="add-task-btn" onClick={() => setShowModal(true)} title="Create a new task">
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      {showSearchResults && (
        <div className="search-results-container">
          <div className="search-results-header">
            <h3>Search Results</h3>
            {searchResults.length > 0 && <span className="result-count">{searchResults.length} found</span>}
          </div>
          {searchResults.length === 0 ? (
            <div className="no-results">
              <p>No tasks found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="search-results-grid">{searchResults.map((todo, index) => renderTaskCard(todo, index))}</div>
          )}
        </div>
      )}

      <Create onsubmit={() => setFetchTasks(true)} isModalOpen={showModal} onModalClose={() => setShowModal(false)} />

      <div className="all-tasks">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <h2>No tasks in this category</h2>
          </div>
        ) : (
          filteredTodos.map((todo, index) => renderTaskCard(todo, index))
        )}
      </div>
    </div>
  )
}

export default Home
