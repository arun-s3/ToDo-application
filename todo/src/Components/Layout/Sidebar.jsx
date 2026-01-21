import React from 'react'
import "./Sidebar.css"

import { ChartNoAxesCombined, ClipboardList, SquareCheck, Clock, Zap, Calendar, X} from "lucide-react"

import { useTheme } from "../../Context/ThemeContext"
import { useAuth } from "../../Context/AuthContext"


const Sidebar = ({ currentView, onViewChange, mobileMenuOpen, setMobileMenuOpen }) => {

  const { isDarkMode } = useTheme()

  const { authLoading, isAuthStabilizing } = useAuth()

  const taskFilters = [
    { id: "all", label: "All Tasks", icon: ClipboardList },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "completed", label: "Completed", icon: SquareCheck },
    { id: "today", label: "Due Today", icon: Calendar },
    { id: "high-priority", label: "High Priority", icon: Zap },
  ]


  return (
      <div className={`sidebar ${mobileMenuOpen ? "open" : "close"} ${isDarkMode ? "dark-mode" : ""}`}>
          <div className='sidebar-top'>
              <div className='mobile-header-close' style={!mobileMenuOpen ? { display: "none" } : {}}>
                  <button onClick={() => setMobileMenuOpen(false)}>
                      <X />
                  </button>
              </div>
              <div className='sidebar-logo'>
                  <img src='./ZenTaskLogo.png' alt='ZenTask' />
                  <h2>
                      {" "}
                      Zen <span> Task </span>
                  </h2>
              </div>

              <div className='sidebar-section'>
                  <div
                      className={`sidebar-item ${currentView === "dashboard" ? "active" : ""}`}
                      style={authLoading || isAuthStabilizing ? { cursor: "not-allowed" } : {}}
                      onClick={() => {
                          if (authLoading || isAuthStabilizing) return
                          onViewChange("dashboard")
                          if (mobileMenuOpen) {
                              setMobileMenuOpen(false)
                          }
                      }}>
                      <ChartNoAxesCombined size={20} className={`${currentView === "dashboard" ? "active" : ""}`} />
                      <span>Dashboard</span>
                  </div>
              </div>

              <div className='sidebar-section'>
                  <h3 className='sidebar-section-title'>Tasks</h3>
                  <div className='sidebar-items-group'>
                      {taskFilters.map((filter) => {
                          const Icon = filter.icon
                          return (
                              <div
                                  key={filter.id}
                                  className={`sidebar-item ${currentView === filter.id ? "active" : ""}`}
                                  style={authLoading || isAuthStabilizing ? { cursor: "not-allowed" } : {}}
                                  onClick={() => {
                                      if (authLoading || isAuthStabilizing) return
                                      onViewChange(filter.id)
                                      if (mobileMenuOpen) {
                                          setMobileMenuOpen(false)
                                      }
                                  }}>
                                  <Icon size={18} className={`${currentView === filter.id ? "active" : ""}`} />
                                  <span>{filter.label}</span>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      </div>
  )
}

export default Sidebar
