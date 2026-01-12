import React, { useState, useEffect, useRef } from "react"
import "./FilterBar.css"

import {ArrowUpDown} from "lucide-react"


const FilterBar = ({ sortOption, onSortChange}) => {

    const [showSortMenu, setShowSortMenu] = useState(false)

    const filterRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowSortMenu(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") setShowSortMenu(false)
        }

        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [])

    const sortOptions = [
        { value: "date", label: "Date (Newest)" },
        { value: "date-old", label: "Date (Oldest)" },
        { value: "priority-high", label: "Priority (High to Low)" },
        { value: "priority-low", label: "Priority (Low to High)" },
        { value: "starred", label: "Starred First" },
        { value: "deadline", label: "Deadline (Earliest)" },
        { value: "deadline-latest", label: "Deadline (Latest)" },
        { value: "created", label: "Created Date" },
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
                                key={option.value}
                                className={`dropdown-item ${sortOption === option.value ? "active" : ""}`}
                                onClick={() => {
                                    onSortChange(option.value)
                                    setShowSortMenu(false)
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
