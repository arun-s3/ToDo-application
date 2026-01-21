import React, { useState, useEffect, useRef, useMemo } from "react"
import "./Home.css"

import { api } from "../../../api/axiosInstance"
import { toast } from 'sonner'
import { Plus } from "lucide-react"

import CreateTask from "../../../Modals/CreateTask/CreateTask"
import TaskCard from "../../Tasks/TaskCard"
import FilterBar from "./FilterBar"
import SearchTasks from "./SearchTasks"
import HomeHeader from "./HomeHeader"
import TaskCardLoader from "../../Tasks/TaskCardLoader"
import TaskDeleteModal from "../../../Modals/TaskDeleteModal"
import GuestModeModal from "../../../Modals/GuestModeModal"
import HeroSection from "./HeroSection"
import Pagination from "./Pagination"

import { useAuth } from "../../../Context/AuthContext"
import { useTheme } from "../../../Context/ThemeContext"
import { shouldShowGuestSignupModal } from '../../../utils/guestPrompt'
import { dummyTask } from "../../../data/dummyTask"

import { processTasks } from "../../../utils/taskOperations"
import { mapSortAndSortByToSortLabel } from "../../../utils/sortMap"


export default function Home({ activeTab = "all", restoreTab, isDemoTaskLockedRef, openAuthModal}) {

    const [todos, setTodo] = useState([])
    const [fetchTasks, setFetchTasks] = useState(true)
    const [showTaskCardLoader, setShowTaskCardLoader] = useState(false)

    const [editingId, setEditingId] = useState({title: false, desc: false, taskId: null})

    const [sortBy, setSortBy] = useState("createdAt") 
    const [sort, setSort] = useState(-1)
    const [isSorting, setIsSorting] = useState(false)

    const [searchQuery, setSearchQuery] = useState("")

    const [restoreFilters, setRestoreFilters] = useState(false)

    const [showTaskModal, setShowTaskModal] = useState(false)

    const [openTaskDeleteModal, setOpenTaskDeleteModal] = useState({id: null, title: null, isDemo: false})
    const [isDeleting, setIsDeleting] = useState(false)

    const [updateTask, setUpdateTask] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(4)
    const [totalTodos, setTotalTodos] = useState(0)
    const [overallTodos, setOverallTodos] = useState(0)

    const [openGuestModeModal, setOpenGuestModeModal] = useState(false)

    const { isGuest, guestId, user, authReady, authLoading } = useAuth() 

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
            const response = await api.post("/tasks", { taskQueryOptions })

            if (response && response?.data?.success) {
                setTodo(response.data.todos)
                setTotalTodos(response.data.total)

                if(isSorting) setIsSorting(false)
                setOverallTodos(response.data.overallTotal)
            }
        } catch (error) {
            console.error("Error while getting tasks:", error)

            if (isSorting) setIsSorting(false)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Something went wrong! Please check your network and retry again later.")
            }
        } finally {
            setShowTaskCardLoader(false)
        }
    }

    const processLocalTodos = (currentTodos)=> {
        if (currentTodos.length === 0) return

        const sortLabel = mapSortAndSortByToSortLabel(sortBy, sort)
        const processedLocalTodos = processTasks({ todos: currentTodos, activeTab, searchQuery, sortLabel, limit })
        
        setTodo(processedLocalTodos)
    }

    useEffect(() => {
        if (!authReady) return
        setShowTaskCardLoader(true)

        processLocalTodos(todos)

        const taskQueryOptions = getTaskQueryOptions()
        getTasks(taskQueryOptions)
    }, [authReady, activeTab, guestId, user, currentPage, limit, sortBy, sort, searchQuery])

    useEffect(() => {
        if (fetchTasks) {
            processLocalTodos(todos)

            const taskQueryOptions = getTaskQueryOptions()
            getTasks(taskQueryOptions)
            setFetchTasks(false)
        }
    }, [fetchTasks]) 

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
            console.error("Error adding demo:", error)
        } finally {
            addingDemoRef.current = false
        }
    }

    useEffect(() => {
        if (!isGuest || !guestId) return
        if (!authReady) return  
        if (isDemoTaskLockedRef.current) return 

        const hasSeen = localStorage.getItem("hasSeenDemoTask") === "true"

        const alreadyInjected = todos.some((todo) => todo.isDemo)

        if (!hasSeen && !alreadyInjected && todos.length === 0) {
            isDemoTaskLockedRef.current = true
            addDummyTask()
        }
    }, [isGuest, guestId, authReady, todos.length])

    useEffect(() => {
        if (isGuest) return
        if (!user) return
        if (!authReady) return  

        const alreadyInjected = todos.some((todo) => todo.isDemo)

        if (!user.hasSeenDemoTask && !alreadyInjected && todos.length === 0) {
            addDummyTask()
        }
    }, [user, authReady, todos])

    useEffect(() => {
        if (restoreFilters) {
            setTimeout(()=> setRestoreFilters(false), 1000)
        }
    }, [restoreFilters]) 

    const createNewTask = ()=> {
        if (isGuest && shouldShowGuestSignupModal()) {
            setOpenGuestModeModal(true) 
            localStorage.setItem("guestSignupPromptLastShown", Date.now())
            return
        }
        setShowTaskModal(true)
        setRestoreFilters(true)
        if(sortBy !== "createdAt") setSortBy("createdAt") 
        if(sort !== -1) setSort(-1) 
        if(searchQuery) setSearchQuery('') 
        if(activeTab !== "all") restoreTab()
        if(currentPage > 1) setCurrentPage(1)
    }

    const addNewTask = (task) => {

        const tempId = "temp-" + Date.now()
        setTodo((todos) => [{ ...task, _id: tempId, isTemp: true, syncing: true }, ...todos])
        
        api.post(`tasks/add`, { task })
            .then((response) => {
                const newTodo = response.data.data
                setTodo((prev) =>
                    prev.map((todo) => {
                        if (todo._id === tempId) {
                            return newTodo
                        }
                        return todo
                    }),
                )
                if (isGuest && guestId && !task.isDemo) {
                    localStorage.setItem("hasSeenDemoTask", "true")
                }
            })
            .catch((error) => {
                const message =
                    error?.response?.data?.message || error?.message || "Something went wrong. Please cehck your network and try again."

                toast.error(message)
                setTodo((prev) => prev.filter((todo) => todo._id !== tempId))
            })
    }

    const UpdateTask = (task) => {
        const currentTodos = [...todos]
        const newTodos = todos.map((todo) => {
            if (todo._id === task._id) {
                todo = task
                todo.syncing = true
            }
            return todo
        }) 
        processLocalTodos(newTodos)
        api.put(`tasks/update/${task._id}`, { task })
            .then((result) => {})
            .catch((error) => {
                const message =
                    error?.response?.data?.message || error?.message || "Something went wrong. Please cehck your network and try again."

                toast.error(message)
                setTodo(currentTodos)
            })
            .finally(()=> {
                setTodo((prev) =>
                    prev.map((todo) => {
                        if (todo._id === task._id) {
                            todo.syncing = false
                        }
                        return todo
                    }),
                )
                setFetchTasks(true)
            })
    }

    const toggleDoneHandler = (e, currentTodo) => {
        e.stopPropagation()
        const currentTodos = [...todos]
        const newDone = !currentTodo.done
        if ((newDone && activeTab === "pending") || (!newDone && activeTab === "completed")) {
            setTodo((todos) => todos.filter((todo) => todo._id !== currentTodo._id))
        } else{
            const newTodos = todos.map((todo) => {
                if (todo._id === currentTodo._id) {
                    todo.done = newDone
                    todo.syncing = true
                }
                return todo
            })
            setTodo(newTodos)
        }
        api.patch(`tasks/done/${currentTodo._id}`, { done: newDone })
            .then(result=> {})
            .catch(error=> {
                    setTodo(currentTodos)
                    const message =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Something went wrong. Please cehck your network and try again."

                    toast.error(message)
            })
            .finally(()=> {
                setTodo((prev) =>
                    prev.map((todo) => {
                        if (todo._id === currentTodo._id) {
                            todo.syncing = false
                        }
                        return todo
                    }),
                )
            })
    }

    const askUserConfirmation = (id, title, isDemo) => {
        setOpenTaskDeleteModal({ id, title, isDemo })
    }

    const handleTrash = (id, isDemo)=>{
        setIsDeleting(true)

        const currentTodos = [...todos]
        if (isGuest && guestId && isDemo) {
            localStorage.setItem("hasSeenDemoTask", "true")
            isDemoTaskLockedRef.current = true
        }
        const newTodos = todos.filter((todo) => todo._id !== id)
        setTodo(newTodos)
        
        api.delete(`tasks/delete/${id}`)
             .then(result=> {
                setIsDeleting(false)
             })
             .catch(error=> {
                    const message =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Something went wrong. Please cehck your network and try again."

                    toast.error(message)
                    setTodo(currentTodos)
                    if (isGuest && guestId && isDemo) {
                        localStorage.setItem("hasSeenDemoTask", "false")
                        isDemoTaskLockedRef.current = false
                    }
             })
             .finally(()=> {
                setIsDeleting(false)
             })
    }

    const initiateTaskEditing = (task) => {
        setShowTaskModal(true)
        setUpdateTask(task)
    }

    const handleEditTitleDesc = (e, currentTodo, type) => {
        const value = e.target.value
        const currentTodos = [...todos] 
        const taskPatch = { [type]: value } 
        e.target.style.borderBottom = ""
        const newTodos = todos.map((todo) => {
            if (todo._id === currentTodo._id) {
                todo[type] = value
            }
            return todo
        })
        if(searchQuery.trim()){
            processLocalTodos(newTodos)
        }else setTodo(newTodos)
        api.put(`tasks/update/${currentTodo._id}`, { task: taskPatch })
            .then((result) => {})
            .catch((error) => {
                const message =
                    error?.response?.data?.message || error?.message || "Something went wrong. Please cehck your network and try again."

                toast.error(message)
                console.error("Error while editing title/desc---->", error)
            })
        setEditingId((fields) => ({ ...fields, taskId: null, [type]: false }))
    }

    const handleToggleChecklistItems = async (currentTodos, taskId, itemId, itemIndex) => {
        try {
            await api.patch(`tasks/${taskId}/checklist/${itemId}/toggle`)
        } catch (error) {
            console.error("Error while toggling checklist item:", error)

            setTodo(currentTodos)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Something went wrong! Please check your network and retry again later.")
            }

        } finally {
            setTodo((todos) =>
                todos.map((todo) => {
                    if (todo._id === taskId) {
                        const updatedChecklist = [...todo.checklist]
                        updatedChecklist[itemIndex].syncing = false

                        return { ...todo, checklist: updatedChecklist }
                    }
                    return todo
                }),
            )
        }
    }

    const toggleChecklistItem = async(taskId, itemIndex, itemId) => {
        const currentTodos = [...todos] 
        const updatedTodos = todos.map((todo) => {
            if (todo._id === taskId) {
                const updatedChecklist = [...todo.checklist]
                updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed
                updatedChecklist[itemIndex].syncing = true

                return { ...todo, checklist: updatedChecklist }
            }
            return todo
        })
        setTodo(updatedTodos)
        await handleToggleChecklistItems(currentTodos, taskId, itemId, itemIndex)
    }

    const handleToggleStarTask = async (currentTodos, taskId) => {
        try {
            await api.patch(`tasks/${taskId}/star/toggle`)
        } catch (error) {
            console.error("Error while toggling star:", error)

            setTodo(currentTodos)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Something went wrong! Please check your network and retry again later.")
            }

        } finally {
            setTodo((todos) =>
                todos.map((todo) => {
                    if (todo._id === taskId) {
                        return { ...todo, starSyncing: false }
                    }
                    return todo
                }),
            )
        }
    }

    const handleToggleStar = async(taskId) => {
        const currentTodos = [...todos] 
        const updatedTodos = todos.map((todo) => {
            if (todo._id === taskId) {
                const newStarred = !todo.starred
                return { ...todo, starred: newStarred, starSyncing: true }
            }
            return todo
        })
        processLocalTodos(updatedTodos)
        await handleToggleStarTask(currentTodos, taskId) 
    } 

    const shouldShowHero =
        !authLoading && authReady && (overallTodos === 0 || (todos.length > 0 && todos.every((todo) => todo.isDemo)))

    const filteredTodos = useMemo(() => {
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
    }, [todos, user, isGuest])


    return (
        <div className={`home ${isDarkMode ? "dark" : ""}`}>
            <HomeHeader currentTab={activeTab} />

            <div className='search-and-add-wrapper'>
                <SearchTasks onsearchQuery={setSearchQuery} restoreSearch={restoreFilters} />

                <button
                    className='add-task-btn'
                    onClick={() => createNewTask()}
                    title='Create a new task'
                    disabled={authLoading || showTaskCardLoader}>
                    <Plus size={20} />
                    <span>Add Task</span>
                </button>
            </div>

            <CreateTask
                isModalOpen={showTaskModal}
                onModalClose={() => setShowTaskModal(false)}
                editTask={updateTask}
                onLocalUpdateTodos={setTodo}
                onAddTask={addNewTask}
                onUpdateTask={UpdateTask}
            />

            {searchQuery && (
                <span className='result-count'>
                    {totalTodos} {`${totalTodos === 1 ? "Task" : "Tasks"}`} found
                </span>
            )}

            {shouldShowHero && <HeroSection onCreateTask={createNewTask} />}

            {filteredTodos.length > 0 && (
                <FilterBar
                    sortOption={sortBy}
                    onSortByChange={setSortBy}
                    sortWay={sort}
                    onSortChange={setSort}
                    sorting={isSorting}
                    onSorting={setIsSorting}
                    todos={todos}
                    onLocalUpdateTodos={setTodo}
                    restoreFilter={restoreFilters}
                    itemsPerPage={limit}
                    onItemsPerPageChange={setLimit}
                    onPageChange={setCurrentPage}
                />
            )}

            <div
                className={`all-tasks ${!showTaskCardLoader ? "visible" : ""}`}
                style={
                    filteredTodos.length === 0 || (filteredTodos.length === 1 && filteredTodos[0].isDemo)
                        ? { display: "inline-block" }
                        : {}
                }>
                {filteredTodos.length === 0 && !showTaskCardLoader && !authLoading ? (
                    <div className='empty-state'>
                        <h2>No tasks in this category</h2>
                    </div>
                ) : (
                    filteredTodos.length > 0 && !authLoading &&
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
                {authLoading && (
                    <div className='home-logo-loader'>
                        <div className='home-logo loading'>
                            <img src='./ZenTaskLogo.png' alt='ZenTask' />
                            <h2>
                                Zen <span>Task</span>
                            </h2>
                        </div>
                    </div>
                )}
                {filteredTodos.length > 0 && showTaskCardLoader && !authLoading && (
                    <div
                        className='loader-wrapper'
                        style={{
                            position: "absolute",
                            top: "-3rem",
                            left: "2rem",
                        }}>
                        <div className='loader' style={{ width: 30, height: 30 }} />
                    </div>
                )}
                {filteredTodos.length === 0 && showTaskCardLoader && <TaskCardLoader count={4} />}
            </div>

            {filteredTodos.length > 0 && !authLoading && !showTaskCardLoader && (
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
                    setShowTaskModal(true)
                }}
                onSignup={() => {
                    setOpenGuestModeModal(false)
                    openAuthModal()
                }}
            />
        </div>
    )
}

