import React from "react"
import "./Pagination.css"

import { ChevronLeft, ChevronRight } from "lucide-react"


const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {

    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages


    return (
        <div className='pagination-controls'>
            <button
                className={`pagination-btn prev-btn ${!canGoPrevious ? "disabled" : ""}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                title='Previous page'>
                <ChevronLeft size={18} />
            </button>

            <span className='pagination-info'>
                <span className='current-page'>{currentPage}</span>
                <span className='divider'>/</span>
                <span className='total-pages'>{totalPages || 1}</span>
            </span>

            <button
                className={`pagination-btn next-btn ${!canGoNext ? "disabled" : ""}`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                title='Next page'>
                <ChevronRight size={18} />
            </button>
        </div>
    )
}

export default Pagination
