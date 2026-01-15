import React, { useState, useEffect } from "react"
import "./HeroSection.css"

import {CheckCircle2, Star, Flag, Calendar, Tag, Plus, ArrowRight, Zap, TrendingUp, ClipboardList, Clock, AlertCircle} from "lucide-react"

import { useTheme } from "../../../Context/ThemeContext"


export default function HeroSection({ onCreateTask }) {

    const [isVisible, setIsVisible] = useState(false)
    const [animatingCards, setAnimatingCards] = useState([])

    const { isDarkMode } = useTheme()

    useEffect(() => {
        setIsVisible(true)
        const timings = [0, 100, 200, 300]
        timings.forEach((time, idx) => {
            setTimeout(() => {
                setAnimatingCards((prev) => [...prev, idx])
            }, time)
        })
    }, [])

    const quickReminders = [
        {
            icon: Star,
            title: "Star Important",
            description: "Mark top priorities for quick access",
        },
        {
            icon: Flag,
            title: "Set Priorities",
            description: "Organize by Low, Medium, High",
        },
        {
            icon: Calendar,
            title: "Add Deadlines",
            description: "Never miss an important date",
        },
        {
            icon: Tag,
            title: "Use Tags",
            description: "Categorize and filter tasks",
        },
    ]

    const features = [
        {
            icon: TrendingUp,
            title: "Productivity Dashboard",
            description: "Track trends and progress",
        },
        {
            icon: CheckCircle2,
            title: "Task Overview",
            description: "Complete, pending, high priority, today",
        },
        {
            icon: ClipboardList,
            title: "Smart Organization",
            description: "Search, sort, and filter tasks",
        },
        {
            icon: Zap,
            title: "Real-Time Updates",
            description: "Edit and manage instantly",
        },
    ]

    return (
        <div className={`empty-state-container ${isDarkMode ? "dark" : ""}`}>
            <div className='empty-state-wrapper'>
                <div className={`hero-section ${isVisible ? "visible" : "hidden"}`}>
                    <div className='hero-badge'>
                        <span className='hero-badge-text'>Welcome to ZenTask</span>
                    </div>

                    <h1 className='hero-title'>Your Productivity Starts Here</h1>

                    <p className='hero-description'>
                        Get organized, stay focused, and achieve more with ZenTask. Create your first task to begin.
                    </p>

                    <button onClick={onCreateTask} className='hero-button'>
                        <Plus size={16} />
                        Create First Task
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div className='quick-reminders-section'>
                    <div className='section-header'>
                        <h2 className='section-title'>Quick Tips</h2>
                        <p className='section-subtitle'>Make the most of ZenTask</p>
                    </div>

                    <div className='reminders-grid'>
                        {quickReminders.map((reminder, idx) => {
                            const IconComponent = reminder.icon
                            return (
                                <div
                                    key={idx}
                                    className={`reminder-card ${animatingCards.includes(idx) ? "animate" : ""}`}>
                                    <div className={`reminder-card-inner reminder-blue`}>
                                        <div className={`reminder-icon-container reminder-icon-blue`}>
                                            <IconComponent className='reminder-icon' />
                                        </div>

                                        <h3 className='reminder-title'>{reminder.title}</h3>

                                        <p className='reminder-text'>{reminder.description}</p>

                                        <div className='reminder-pulse-dot' />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className='features-section'>
                    <div className='section-header'>
                        <h2 className='section-title'>Features</h2>
                        <p className='section-subtitle'>Everything you need to manage tasks</p>
                    </div>

                    <div className='features-grid'>
                        {features.map((feature, idx) => {
                            const IconComponent = feature.icon
                            return (
                                <div key={idx} className='feature-card'>
                                    <div className='feature-content'>
                                        <div className='feature-icon-container'>
                                            <IconComponent className='feature-icon' />
                                        </div>
                                        <div className='feature-text'>
                                            <h3 className='feature-title'>{feature.title}</h3>
                                            <p className='feature-description'>{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className='instructions-section'>
                    <div className='instructions-header'>
                        <div className='instructions-icon-container'>
                            <AlertCircle className='instructions-icon' />
                        </div>
                        <div>
                            <h3 className='instructions-title'>How to Use ZenTask</h3>
                            <p className='instructions-subtitle'>Follow these simple steps</p>
                        </div>
                    </div>

                    <div className='steps-grid'>
                        {[
                            {
                                num: "1",
                                title: "Create a Task",
                                description:
                                    "Click the button above to open the task modal. Add title, description, priority, tags, and deadline.",
                            },
                            {
                                num: "2",
                                title: "Organize & Manage",
                                description:
                                    "Use the sidebar to navigate between task views. Search by title, description, or tags.",
                            },
                            {
                                num: "3",
                                title: "Track Progress",
                                description:
                                    "Check off items, view completion %, and monitor productivity trends on the dashboard.",
                            },
                        ].map((step, idx) => (
                            <div key={idx} className='step-card'>
                                <div className='step-number'>{step.num}</div>
                                <div className='step-text'>
                                    <h4 className='step-title'>{step.title}</h4>
                                    <p className='step-description'>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='security-notices'>
                    <div className='notice-card notice-amber'>
                        <Clock className='notice-icon notice-amber-icon' />
                        <div className='notice-content'>
                            <h4 className='notice-title'>Guest Mode Warning</h4>
                            <p className='notice-text'>
                                As a guest, tasks are temporary. Sign in to securely save and sync tasks.
                            </p>
                        </div>
                    </div>

                    <div className='notice-card notice-green'>
                        <CheckCircle2 className='notice-icon notice-green-icon' />
                        <div className='notice-content'>
                            <h4 className='notice-title'>Sign In to Migrate</h4>
                            <p className='notice-text'>
                                Create tasks as guest, then sign in to migrate and sync all tasks to your account.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='final-cta'>
                    <div className='final-cta-wrapper'>
                        <h3 className='final-cta-title'>Ready to boost productivity?</h3>
                        <button onClick={onCreateTask} className='hero-button'>
                            <Plus size={16} />
                            Start Your First Task
                        </button>
                    </div>
                </div>
            </div>

            <div className='floating-bg'>
                <div className='floating-blob-1' />
                <div className='floating-blob-2' />
            </div>
        </div>
    )
}
