import React, { useState } from "react"
import "./App.css"

import { Moon, Sun, LogIn } from "lucide-react"

import Home from "./Home"
import Sidebar from "./Sidebar"


export default function ZenTaskPage() {

  const [currentView, setCurrentView] = useState("all")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const isHomeView = ["all", "pending", "completed", "today", "high-priority"].includes(currentView)
  const isDashboardView = currentView === "dashboard"

  const handleSignIn = () => {
    console.log("Inside handleSignIn()..")
  }

  return (
    <div className={`app-container ${isDarkMode ? "dark" : ""}`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Top Navbar with theme toggle and sign-in */}
      <nav className={`top-navbar ${isDarkMode ? "dark" : ""}`}>
        <div className="navbar-spacer" />
        <div className="navbar-actions-right">
          <button className="theme-toggle" onClick={()=> setIsDarkMode(mode=> !mode)} title="Toggle dark mode">
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button className="sign-in-btn" onClick={handleSignIn}>
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`app-main ${isDarkMode ? "dark" : ""}`}>
        {isHomeView && <Home activeTab={currentView} />}
        {isDashboardView && <p> Dashboard </p>}
      </main>
    </div>
  )
}

