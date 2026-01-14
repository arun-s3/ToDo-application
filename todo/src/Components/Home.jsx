import React, { useState, useEffect, useRef } from "react"
import "./Home.css"

import { api } from "../api/axiosInstance"
import { toast } from 'sonner'
import { Calendar, Search, Plus, ClipboardList, SquareCheck, Clock, Zap } from "lucide-react"

import CreateTask from "../Modals/CreateTask"
import TaskCard from "./TaskCard"
import FilterBar from "./FilterBar"
import TaskDeleteModal from "../Modals/TaskDeleteModal"
import GuestModeModal from "../Modals/GuestModeModal"
import HeroSection from "./HeroSection"
import Pagination from "./Pagination"

import { useAuth } from "../Context/AuthContext"
import { shouldShowGuestSignupModal } from '../Utils/GuestPrompt'
import { dummyTask } from "../data/dummyTask"


export default function Home({ activeTab = "all", openAuthModal }) {

    const [todos, setTodo] = useState([])
    const [fetchTasks, setFetchTasks] = useState(false)

    const [editingId, setEditingId] = useState({title: false, desc: false, taskId: null})

    const [sortBy, setSortBy] = useState("created")
    const [sort, setSort] = useState(-1)

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])

    const [showModal, setShowModal] = useState(false)

    const [openTaskDeleteModal, setOpenTaskDeleteModal] = useState({id: null, title: null})
    const [isDeleting, setIsDeleting] = useState(false)

    const [updateTask, setUpdateTask] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [totalTodos, setTotalTodos] = useState(0)

    const [openGuestModeModal, setOpenGuestModeModal] = useState(false)

    const { isGuest, user } = useAuth()

    useEffect(() => {
        if (fetchTasks) {
            getTasks()
            setFetchTasks(false)
        }
    }, [fetchTasks]) 

    useEffect(() => {
        setFetchTasks(true)
    }, [isGuest, user]) 

    const addDummyTask = ()=> {
        console.log(`Adding dummy task for ${isGuest ? "guest" : "user"}`)
        api.post(`tasks/add`, { task: dummyTask })
            .then((response) => {
                if (response.data.data.isDemo && isGuest) {
                    const hasGuestSeen = localStorage.getItem("hasSeenDemoTask") === "true"
                    console.log(`Was hasGuestSeen true for guest?---->${hasGuestSeen ? 'yes' : 'no'}`)
                    if (!hasGuestSeen) {
                        localStorage.setItem("hasSeenDemoTask", "true")
                    }
                }
                console.log(response)
                setFetchTasks(true)
            })
            .catch((error) => {
                console.log("Error---->", error.response.data.message)
            })
    }

    useEffect(() => {
        if (!isGuest) return

        const hasSeen = localStorage.getItem("hasSeenDemoTask") === "true"

        const alreadyInjected = todos.some((todo) => todo.isDemo)
        console.log("Demo task alreadyInjected for guest---->", alreadyInjected)

        console.log(`hasSeen----> ${hasSeen}, todos.length----> ${todos.length}`)

        if (!hasSeen && !alreadyInjected && todos.length === 0) {
            addDummyTask()
        }
    }, [isGuest, todos])

    useEffect(() => {
        if (isGuest) return
        if (!user) return

        const alreadyInjected = todos.some((todo) => todo.isDemo)
        console.log("Demo task alreadyInjected for user---->", alreadyInjected)

        console.log(`user.hasSeenDemoTask----> ${user.hasSeenDemoTask}, todos.length----> ${todos.length}`)

        if (!user.hasSeenDemoTask && !alreadyInjected && todos.length === 0) {
            addDummyTask()
        }
    }, [user, todos])


    const getTasks = async (taskQueryOptions) => {
        try {
            console.log("Getting tasks with the options--->", taskQueryOptions)
            const response = await api.post("/tasks", { taskQueryOptions })

            if (response && response?.data?.success) {
                setTodo(response.data.todos)
                setTotalTodos(response.data.total)
            }
        } catch (error) {
            console.error("Error while getting tasks:", error)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Something went wrong! Please check your network and retry again later.")
            }
        }
    }

    useEffect(() => {
        if (!activeTab) return

        const activeTabMap = {
            "today": "dueToday",
            "high-priority": "highPriority",
        }
        const activeTabValue = activeTab === "today" || activeTab === "high-priority" ? activeTabMap[activeTab] : activeTab

        const taskQueryOptions = {
            type: activeTabValue,
            page: currentPage,
            limit,
            sortBy,
            sort,
            search: searchQuery,
        }

        getTasks(taskQueryOptions)
    }, [activeTab, currentPage, limit, sortBy, sort, searchQuery])

    const createNewTask = ()=> {
        if (isGuest && shouldShowGuestSignupModal()) {
            setOpenGuestModeModal(true) 
            localStorage.setItem("guestSignupPromptLastShown", Date.now())
            return
        }
        setShowModal(true)
    }


    const handleSearch = (query) => {
        setSearchQuery(query)
        if (query.trim() === "") {
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

        return todos
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

    const askUserConfirmation = (id, title)=> {
        setOpenTaskDeleteModal({ id, title })
    }

    const handleTrash = (id)=>{
        setIsDeleting(true)
        api.delete(`tasks/delete/${id}`)
             .then(result=> {
                console.log(result)
                setIsDeleting(false)
             })
             .catch(error=> {
                    toast.error(error.response.data.message)
                    console.log("Error---->", error.response.data.message)
                    setIsDeleting(false)
             })
        const newTodos = todos.filter(todo=> todo._id !== id)
        setTodo(newTodos)
    }

    const initiateTaskEditing = (task) => {
        setShowModal(true)
        setUpdateTask(task)
    }

    const handleEditTitleDesc = (e, currentTodo, type) => {
        const value = e.target.value
        console.log("type--->", type)
        const taskPatch = { [type]: value }
        e.target.style.borderBottom = ""
        api.put(`tasks/update/${currentTodo._id}`, { task: taskPatch })
            .then((result) => {
                if (result) {
                    console.log(result)
                    const newTodos = todos.map((todo) => {
                        if (todo._id === currentTodo._id) {
                            todo[type] = value
                        }
                        return todo
                    })
                    setTodo(newTodos)
                }
            })
            .catch((error) => {
                toast.error(error.response.data.message)
                console.log("Error---->", error.response.data.message)
            })
        setEditingId((fields) => ({ ...fields, taskId: null, [type]: false }))
    }

    const updateTaskCard = (task)=> {
        console.log("Inside updateTaskCard()..")
        const newTodos = todos.map((todo) => {
            if (todo._id === task._id) {
                todo = task
            }
            return todo
        })
        setTodo(newTodos)
    }

    const handleToggleChecklistItems = async (taskId, itemIndex, itemId) => {
        try {
                const response = await api.patch(`tasks/${taskId}/checklist/${itemId}/toggle`)
            
                if (response && response?.data?.success) {
                    return true
                }
            } catch (error) {
                console.error("Error while toggling checklist item:", error)
    
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message)
                } else {
                    toast.error("Something went wrong! Please check your network and retry again later.")
                }
    
                return false
            }
    }

    const toggleChecklistItem = async(taskId, itemIndex, itemId) => {
        console.log(`taskId---> ${taskId}, itemIndex---> ${itemIndex} and itemId---> ${itemId}`)
        const response = await handleToggleChecklistItems(taskId, itemIndex, itemId)
        if(!response) return

        const updatedTodos = todos.map((todo) => {
            if (todo._id === taskId) {
            const updatedChecklist = [...todo.checklist]
            updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed

            return { ...todo, checklist: updatedChecklist }
            }
            return todo
        })
        setTodo(updatedTodos)
    }

    const handleToggleStarTask = async (taskId) => {
        try {
                const response = await api.patch(`tasks/${taskId}/star/toggle`)
            
                if (response && response?.data?.success) {
                    return true
                }
            } catch (error) {
                console.error("Error while toggling star:", error)
    
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message)
                } else {
                    toast.error("Something went wrong! Please check your network and retry again later.")
                }
    
                return false
            }
    }

    const handleToggleStar = async(taskId) => {
        const response = await handleToggleStarTask(taskId) 
        if(!response) return

        const updatedTodos = todos.map((todo) => {
            if (todo._id === taskId) {
                const newStarred = !todo.starred
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
          <div className='home-header'>
              <div className='tab-wrapper'>
                  <i className='icon'>{getTabIcon()}</i>
                  <h2 className='title'>{getTabLabel()}</h2>
              </div>
              <p className='subtitle'>{getTabSubtitle()}</p>
          </div>

          <div className='search-and-add-wrapper'>
              <div className='search-container'>
                  <div className='search-input-wrapper'>
                      <Search size={20} className='search-icon' />
                      <input
                          type='text'
                          placeholder='Search tasks by title, description, or tags...'
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className='search-input'
                      />
                  </div>
              </div>

              <button className='add-task-btn' onClick={() => createNewTask()} title='Create a new task'>
                  <Plus size={20} />
                  <span>Add Task</span>
              </button>
          </div>

          <CreateTask
              onsubmit={() => setFetchTasks(true)}
              isModalOpen={showModal}
              onModalClose={() => setShowModal(false)}
              editTask={updateTask}
              onUpdateSuccess={updateTaskCard}
          />

          {searchQuery && (
              <span className='result-count'>
                  {totalTodos} {`${totalTodos === 1 ? "Task" : "Tasks"}`} found
              </span>
          )}

          {filteredTodos.length === 0 ||
                  (filteredTodos.length === 1 && filteredTodos[0].isDemo && (
                      <HeroSection onCreateTask={createNewTask} />
                  ))
          }

          {filteredTodos.length > 0 &&
              (
                  <FilterBar
                      sortOption={sortBy}
                      onSortByChange={setSortBy}
                      sortWay={sort}
                      onSortChange={setSort}
                      itemsPerPage={limit}
                      onItemsPerPageChange={setLimit}
                      onPageChange={setCurrentPage}
                  />
              )}

          <div
              className='all-tasks'
              style={
                  filteredTodos.length === 0 || (filteredTodos.length === 1 && filteredTodos[0].isDemo)
                      ? { display: "inline-block" }
                      : {}
              }>

              {filteredTodos.length === 0 ? (
                  <div className='empty-state'>
                      <h2>No tasks in this category</h2>
                  </div>
              ) : (
                  filteredTodos.map((todo, index) => (
                      <TaskCard
                          key={todo._id}
                          todo={todo}
                          index={index}
                          editingId={editingId}
                          setEditingId={setEditingId}
                          onToggleStar={handleToggleStar}
                          onTaskDone={toggleDoneHandler}
                          onEditTitleDesc={handleEditTitleDesc}
                          onToggleChecklistItem={toggleChecklistItem}
                          onTaskEdit={initiateTaskEditing}
                          onDeleteTask={askUserConfirmation}
                      />
                  ))
              )}
          </div>

          {filteredTodos.length > 0 && (
              <Pagination
                  currentPage={currentPage}
                  totalItems={totalTodos}
                  itemsPerPage={limit}
                  onPageChange={setCurrentPage}
              />
          )}

          <TaskDeleteModal
              isOpen={openTaskDeleteModal.id}
              taskName={openTaskDeleteModal.title}
              onConfirm={() => {
                  handleTrash(openTaskDeleteModal.id)
                  setOpenTaskDeleteModal({ id: null, title: null })
              }}
              onCancel={() => setOpenTaskDeleteModal({ id: null, title: null })}
              isLoading={isDeleting}
          />

          <GuestModeModal
              isOpen={openGuestModeModal}
              onCancel={() => {
                  setOpenGuestModeModal(false)
                  setShowModal(true)
              }}
              onSignup={() => {
                  setOpenGuestModeModal(false)
                  openAuthModal()
              }}
          />
      </div>
  )
}

