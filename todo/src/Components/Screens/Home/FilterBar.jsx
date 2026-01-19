import React, { useState, useEffect, useRef } from "react"
import "./FilterBar.css"

import {ArrowUpDown} from "lucide-react"

import { useTheme } from "../../../Context/ThemeContext"


const FilterBar = ({ sortOption, onSortByChange, sortWay, onSortChange, itemsPerPage, onItemsPerPageChange, 
    todos, onLocalUpdateTodos, onSorting, sorting, onPageChange }) => {

    const [showSortMenu, setShowSortMenu] = useState(false)
    const [showItemsMenu, setShowItemsMenu] = useState(false)

    const filterRef = useRef(null)
    const limitRef = useRef(null)

    const { isDarkMode } = useTheme()

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowSortMenu(false)
            }
            if (limitRef.current && !limitRef.current.contains(e.target)) {
                setShowItemsMenu(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape"){
                setShowSortMenu(false)
                setShowItemsMenu(false)
            }
        }

        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [])

    const sortOptions = [
        {
            value: "createdAt",
            label: "Created Date (Newest)",
            altLabel: "date-desc",
            sort: -1,
        },
        {
            value: "createdAt",
            label: "Created Date (Oldest)",
            altLabel: "date-asc",
            sort: 1,
        },
        {
            value: "priority",
            label: "Priority (High to Low)",
            altLabel: "priority-high",
            sort: -1,
        },
        {
            value: "priority",
            label: "Priority (Low to High)",
            altLabel: "priority-low",
            sort: 1,
        },
        {
            value: "starred",
            label: "Starred First",
            altLabel: "starred",
            sort: -1,
        },
        {
            value: "deadline",
            label: "Deadline (Earliest)",
            altLabel: "deadline",
            sort: 1,
        },
        {
            value: "deadline",
            label: "Deadline (Latest)",
            altLabel: "deadline-latest",
            sort: -1,
        },
    ]

    const itemsOptions = [
        { value: 2, label: "2 tasks" },
        { value: 4, label: "4 tasks" },
        { value: 6, label: "6 tasks" },
        { value: 8, label: "8 tasks" },
        { value: 10, label: "10 tasks" },
        { value: 20, label: "20 tasks" },
        { value: 30, label: "30 tasks" },
    ]

    const sortTasksLocally = (sortBy) => {
        const sorted = [...todos]

        switch (sortBy) {
            case "date-asc":
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

            case "date-desc":
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            case "priority-low":
                return sorted.sort((a, b) => a.priorityRank - b.priorityRank)

            case "priority-high":
                return sorted.sort((a, b) => b.priorityRank - a.priorityRank)

            case "starred":
                return sorted.sort((a, b) => Number(b.starred) - Number(a.starred))

            case "deadline":
                return sorted.sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0
                    if (!a.deadline) return 1
                    if (!b.deadline) return -1
                    return new Date(a.deadline) - new Date(b.deadline)
                })

            case "deadline-latest":
                return sorted.sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0
                    if (!a.deadline) return 1
                    if (!b.deadline) return -1
                    return new Date(b.deadline) - new Date(a.deadline)
                })

            default:
                return sorted
        }
    }


    return (
        <div className={`filter-bar ${isDarkMode ? "dark-mode" : ""} `} >

            {sorting && (
                <div className="loader" style={{ width: 20, height: 20 }} />
            )}

            <div className={`filter-item sort-dropdown`} ref={filterRef}>
                <button className={`filter-btn  ${sorting ? 'cursor-disabled' : ''}`} onClick={() => {
                    if(sorting) return
                    setShowSortMenu(!showSortMenu)
                }}>
                    <ArrowUpDown size={18} />
                    <span>Sort</span>
                    <span className='arrow'>▼</span>
                </button>
                {showSortMenu && (
                    <div className='dropdown-menu sort-menu'>
                        {sortOptions.map((option) => (
                            <div
                                key={`${option.label}`}
                                className={`dropdown-item ${
                                    sortOption === option.value && sortWay === option.sort ? "active" : ""
                                }`}
                                onClick={() => {
                                    onSorting(true)
                                    onLocalUpdateTodos(sortTasksLocally(option.altLabel))
                                    onSortByChange(option.value)
                                    onSortChange(option.sort)
                                    setShowSortMenu(false)
                                }}>
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='filter-item items-dropdown' ref={limitRef}>
                <button 
                    className={`filter-btn limit-btn  ${sorting ? 'cursor-disabled' : ''}`} 
                    onClick={() => {
                        if(sorting) return
                        setShowItemsMenu(!showItemsMenu)
                    }}>
                    <span>Show:</span>
                    <span className='items-value'>{itemsPerPage}</span>
                    <span className='arrow'>▼</span>
                </button>
                {showItemsMenu && (
                    <div className='dropdown-menu items-menu'>
                        {itemsOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`dropdown-item ${itemsPerPage === option.value ? "active" : ""}`}
                                onClick={() => {
                                    onSorting(true)
                                    onLocalUpdateTodos( todos.slice(0, option.value + 1) )
                                    onItemsPerPageChange(option.value)
                                    setShowItemsMenu(false)
                                    onPageChange(1)
                                }}>
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FilterBar

  