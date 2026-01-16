import React, { useState, useEffect, useRef } from "react"
import "./Home.css"

import { api } from "../../../api/axiosInstance"
import { toast } from 'sonner'
import { Calendar, Search, Plus, ClipboardList, SquareCheck, Clock, Zap } from "lucide-react"

import CreateTask from "../../../Modals/CreateTask/CreateTask"
import TaskCard from "../../Tasks/TaskCard"
import FilterBar from "./FilterBar"
import TaskDeleteModal from "../../../Modals/TaskDeleteModal"
import GuestModeModal from "../../../Modals/GuestModeModal"
import HeroSection from "./HeroSection"
import Pagination from "./Pagination"

import { useAuth } from "../../../Context/AuthContext"
import { useTheme } from "../../../Context/ThemeContext"
import { shouldShowGuestSignupModal } from '../../../Utils/GuestPrompt'
import { dummyTask } from "../../../data/dummyTask"


export default function Home({ activeTab = "all", demoLockRef, openAuthModal}) {

    const [todos, setTodo] = useState([])
    const [fetchTasks, setFetchTasks] = useState(true)

    const [editingId, setEditingId] = useState({title: false, desc: false, taskId: null})

    const [sortBy, setSortBy] = useState("created")
    const [sort, setSort] = useState(-1)

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])

    const [showModal, setShowModal] = useState(false)

    const [openTaskDeleteModal, setOpenTaskDeleteModal] = useState({id: null, title: null, isDemo: false})
    const [isDeleting, setIsDeleting] = useState(false)

    const [updateTask, setUpdateTask] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [totalTodos, setTotalTodos] = useState(0)
    const [overallTodos, setOverallTodos] = useState(0)

    const [openGuestModeModal, setOpenGuestModeModal] = useState(false)

    const { isGuest, guestId, user, authReady } = useAuth() 

    const { isDarkMode } = useTheme()

    const addingDemoRef = useRef(false)

    const getTaskQueryOptions = () => {
        const activeTabMap = {
            today: "dueToday",
            "high-priority": "highPriority",
        }
        const activeTabValue =
            activeTab === "today" || activeTab === "high-priority" ? activeTabMap[activeTab] : activeTab

        return {
            type: activeTabValue,
            page: currentPage,
            limit,
            sortBy,
            sort,
            search: searchQuery,
        }
    }

    const getTasks = async (taskQueryOptions) => {
        try {
            if (isGuest && !guestId) return
            if (!authReady) return  
            console.log("Getting tasks with the options--->", taskQueryOptions)
            const response = await api.post("/tasks", { taskQueryOptions })

            if (response && response?.data?.success) {
                setTodo(response.data.todos)
                setTotalTodos(response.data.total)
                console.log("response.data.overallTotal---->", response.data.overallTotal)
                setOverallTodos(response.data.overallTotal)
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
        if (fetchTasks) {
            const taskQueryOptions = getTaskQueryOptions()
            getTasks(taskQueryOptions)
            setFetchTasks(false)
        }
    }, [fetchTasks]) 

    useEffect(() => {
        if (!authReady) return

        const taskQueryOptions = getTaskQueryOptions()
        getTasks(taskQueryOptions)
    }, [authReady, isGuest, user, activeTab, currentPage, limit, sortBy, sort, searchQuery])

    const addDummyTask = async () => {
        if (!authReady) return  
        if (!isGuest || !guestId) return  
        if (addingDemoRef.current) return
        addingDemoRef.current = true

        try {
            const response = await api.post(`tasks/add`, { task: dummyTask })
            if (response?.data.success) {
                setFetchTasks(true)
            }
        } catch (error) {
            console.log("Error adding demo:", error?.response?.data?.message || error.message)
        } finally {
            addingDemoRef.current = false
        }
    }


    // const removeDuplicateDemoTasks = async()=> {
    //     try {
    //         const response = await api.delete(`demo/delete`)

    //         if (response && response?.data?.success) {
    //             console.log("Remove duplicate demo tasks")
    //         }
    //     } catch (error) {
    //         console.error("Error while removing duplicate demo tasks:", error)
    //     }
    // }

    useEffect(() => {
        if (!isGuest || !guestId) return
        if (!authReady) return  
        if (demoLockRef.current) return 

        const hasSeen = localStorage.getItem("hasSeenDemoTask") === "true"

        const alreadyInjected = todos.some((todo) => todo.isDemo)
        console.log("Demo task alreadyInjected for guest---->", alreadyInjected)

        console.log(`hasSeen----> ${hasSeen}, todos.length----> ${todos.length}. Hence ${!hasSeen && !alreadyInjected && todos.length === 0 ? 'ADDING' : "NOT ADDING"} demo task for guest`)

        if (!hasSeen && !alreadyInjected && todos.length === 0) {
            demoLockRef.current = true
            addDummyTask()
        }
    }, [isGuest, guestId, authReady, todos.length])

    useEffect(() => {
        if (isGuest) return
        if (!user) return
        if (!authReady) return  

        const alreadyInjected = todos.some((todo) => todo.isDemo)
        console.log("Demo task alreadyInjected for user---->", alreadyInjected)

        console.log(`user.hasSeenDemoTask----> ${user.hasSeenDemoTask}, todos.length----> ${todos.length}. Hence ${user.hasSeenDemoTask && !alreadyInjected && todos.length === 0 ? 'ADDING' : "NOT ADDING"} demo task for user`)

        if (!user.hasSeenDemoTask && !alreadyInjected && todos.length === 0) {
            addDummyTask()
        }
    }, [user, authReady, todos])

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

    const askUserConfirmation = (id, title, isDemo) => {
        setOpenTaskDeleteModal({ id, title, isDemo })
    }

    const handleTrash = (id, isDemo)=>{
        setIsDeleting(true)
        api.delete(`tasks/delete/${id}`)
             .then(result=> {
                console.log(result)
                setIsDeleting(false)
                if (isGuest && guestId && isDemo) {
                    localStorage.setItem("hasSeenDemoTask", "true")
                    demoLockRef.current = true
                }
                const newTodos = todos.filter((todo) => todo._id !== id)
                setTodo(newTodos)
             })
             .catch(error=> {
                    toast.error(error.response.data.message)
                    console.log("Error---->", error.response.data.message)
                    setIsDeleting(false)
             })
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

    const getFilteredTasks = () => {
        console.log("todos inside getFilteredTasks----->", todos)
        let hasSeenDemoTask = false

        if (user) {
            hasSeenDemoTask = !!user.hasSeenDemoTask
        } else if (isGuest) {
            hasSeenDemoTask = localStorage.getItem("hasSeenDemoTask") === "true"

        }

        let demoShown = false

        return todos.filter((todo) => {
            if (!todo.isDemo) return true
            if (hasSeenDemoTask) return false
            if (!demoShown) {
                demoShown = true
                return true
            }
            return false
        })
    }

    const filteredTodos = getFilteredTasks()


    return (
        <div className={`home ${isDarkMode ? "dark" : ""}`}>
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
                onsubmit={(task) => {
                    if (isGuest && guestId && !task.isDemo) {
                        localStorage.setItem("hasSeenDemoTask", "true")
                    }
                    setFetchTasks(true)
                }}
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

            {
                ( overallTodos === 0 || todos.every(todo=> todo.isDemo) ) && 
                    <HeroSection onCreateTask={createNewTask} />
            }

            {filteredTodos.length > 0 && (
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
                isTaskDemo={openTaskDeleteModal.isDemo}
                onConfirm={() => {
                    handleTrash(openTaskDeleteModal.id, openTaskDeleteModal.isDemo)
                    setOpenTaskDeleteModal({ id: null, title: null, isDemo: false })
                }}
                onCancel={() => setOpenTaskDeleteModal({ id: null, title: null, isDemo: false })}
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

