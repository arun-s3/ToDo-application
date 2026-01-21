import React, { useState, useRef, useEffect } from "react"
import "./Home.css"
import { debounce } from "lodash"

import { Search } from "lucide-react"

import { useAuth } from "../../../Context/AuthContext"


export default function SearchTasks({ onsearchQuery, restoreSearch = false }) {

    const [taskQuery, setTaskQuery] = useState('')

    const { authLoading, isAuthStabilizing } = useAuth() 

    useEffect(() => {
        if(restoreSearch){
            setTaskQuery('')
        }
    }, [restoreSearch])

    const debouncedSearch = useRef(
        debounce((searchData) => onsearchQuery(searchData), 400)
    ).current

    const handleSearch = (e) => {
        if (authLoading || isAuthStabilizing) return
        const searchData = e.target.value
        setTaskQuery(searchData)
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

