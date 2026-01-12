import React, { useState, useEffect, useRef } from "react"
import "./FilterBar.css"

import {ArrowUpDown} from "lucide-react"


const FilterBar = ({ sortOption, onSortByChange, sortWay, onSortChange, itemsPerPage, onItemsPerPageChange, onPageChange }) => {

    const [showSortMenu, setShowSortMenu] = useState(false)
    const [showItemsMenu, setShowItemsMenu] = useState(false)

    const filterRef = useRef(null)
    const limitRef = useRef(null)

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
            sort: -1,
        },
        {
            value: "createdAt",
            label: "Created Date (Oldest)",
            sort: 1,
        },
        {
            value: "priority",
            label: "Priority (High to Low)",
            sort: -1,
        },
        {
            value: "priority",
            label: "Priority (Low to High)",
            sort: 1,
        },
        {
            value: "starred",
            label: "Starred First",
            sort: -1,
        },
        {
            value: "deadline",
            label: "Deadline (Earliest)",
            sort: 1,
        },
        {
            value: "deadline",
            label: "Deadline (Latest)",
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


    return (
        <div className='filter-bar'>
            <div className='filter-item sort-dropdown' ref={filterRef}>
                <button className='filter-btn' onClick={() => setShowSortMenu(!showSortMenu)}>
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
                <button className='filter-btn limit-btn' onClick={() => setShowItemsMenu(!showItemsMenu)}>
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

  