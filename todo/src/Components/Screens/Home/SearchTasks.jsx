import React, { useState, useRef } from "react"
import "./Home.css"
import { debounce } from "lodash"

import { Search } from "lucide-react"


export default function SearchTasks({ onsearchQuery }) {

    const [taskQuery, setTaskQuery] = useState('')

    const debouncedSearch = useRef(
        debounce((searchData) => onsearchQuery(searchData), 400)
    ).current

    const handleSearch = (e) => {
        const searchData = e.target.value
        setTaskQuery(searchData)
        console.log("searchData--->", searchData)
        debouncedSearch(searchData)
    }


    return (
        <div className='search-container'>
            <div className='search-input-wrapper'>
                <Search size={20} className='search-icon' />
                <input
                    type='text'
                    placeholder='Search tasks by title, description, or tags...'
                    value={taskQuery}
                    onChange={(e) => handleSearch(e)}
                    className='search-input'
                />
            </div>
        </div>
    )
}

