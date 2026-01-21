import React from 'react'
import "./TaskCardLoader.css"


export default function TaskCardLoader({ count = 4 }) {


    return (
        <div className='all-tasks'>
            {Array.from({ length: count }).map((_, index) => (
                <div className='task task-loader' key={index} style={{ animationDelay: `${index * 0.08}s` }}>
                    <div className='task-header'>
                        <div className='skeleton skeleton-icon' />
                    </div>

                    <div className='task-top'>
                        <div className='checkbox'>
                            <div className='skeleton skeleton-checkbox' />
                            <div className='skeleton skeleton-title' />
                        </div>
                        <div className='skeleton skeleton-icon' />
                    </div>

                    <div className='skeleton skeleton-desc' />
                    <div className='skeleton skeleton-desc short' />

                    <div className='task-metadata'>
                        <div className='skeleton skeleton-badge' />
                        <div className='skeleton skeleton-badge' />
                        <div className='skeleton skeleton-badge' />
                    </div>

                    <div className='progress-section'>
                        <div className='skeleton skeleton-progress-text' />
                        <div className='progress-bar'>
                            <div className='skeleton skeleton-progress-fill' />
                        </div>
                    </div>

                    <div className='checklist-section'>
                        <div className='skeleton skeleton-checklist-row' />
                        <div className='skeleton skeleton-checklist-row' />
                    </div>

                    <div className='task-bottom'>
                        <div className='skeleton skeleton-icon' />
                    </div>
                </div>
            ))}
        </div>
    )
}

