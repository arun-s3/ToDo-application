import React from "react"
import "./Home.css"

import { Calendar, ClipboardList, SquareCheck, Clock, Zap } from "lucide-react"


export default function HomeHeader({ currentTab }) {

    const getTabLabel = () => {
        const labels = {
            all: "All Tasks",
            pending: "Pending Tasks",
            completed: "Completed Tasks",
            today: "Due Today's Task",
            "high-priority": "High Priority Tasks",
        }
        return labels[currentTab] || "All Tasks"
    }

    const getTabSubtitle = () => {
        const labels = {
            all: "View all your tasks in one place",
            pending: "Tasks that are still waiting for your action",
            completed: "Tasks you have finished and marked as done",
            today: "Tasks that are scheduled to be completed today",
            "high-priority": "Critical tasks that require your immediate attention",
        }
        return labels[currentTab]
    }

    const getTabIcon = () => {
        const labels = {
            all: ClipboardList,
            pending: Clock,
            completed: SquareCheck,
            today: Calendar,
            "high-priority": Zap,
        }
        const Icon = labels[currentTab]
        return <Icon />
    }


    return (
        <div className='home-header'>
            <div className='tab-wrapper'>
                <i className='icon'>{getTabIcon()}</i>
                <h2 className='title'>{getTabLabel()}</h2>
            </div>
            <p className='subtitle'>{getTabSubtitle()}</p>
        </div>
    )
}
