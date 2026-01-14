import React, { useState, useEffect, useRef } from "react"
import "./App.css"

import { Moon, Sun, LogIn, LogOut } from "lucide-react"

import Home from "./Components/Home"
import Dashboard from "./Components/Dashboard"
import Sidebar from "./Components/Sidebar"
import ModalPortal from "./ModalPortal"
import AuthModal from "./Modals/AuthModal"
import { useAuth } from "./Context/AuthContext"


export default function ZenTaskPage() {

    const [currentView, setCurrentView] = useState("all")
    const [isDarkMode, setIsDarkMode] = useState(false)

    const isHomeView = ["all", "pending", "completed", "today", "high-priority"].includes(currentView)
    const isDashboardView = currentView === "dashboard"

    const [openSignInModal, setOpenSignInModal] = useState(false)

    const { user, setUser, isGuest, guestId, migrateGuest, logout } = useAuth()

    const navRef = useRef(null)

    const scrollHandler = () => {
        if (!navRef.current) return
    
        window.scrollY >= 80 ? navRef.current.classList.add("nav-dark") : navRef.current.classList.remove("nav-dark")
    }

    useEffect(() => {
        window.addEventListener("scroll", scrollHandler)
    
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    }, [])


    return (

      <div className={`app-container ${isDarkMode ? "dark" : ""}`}>
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />

          <nav className={`top-navbar ${isDarkMode ? "dark" : ""}`}>
              <div className='navbar-spacer' />
              <div className='navbar-actions-right' ref={navRef}>
                  <button
                      className='theme-toggle'
                      onClick={() => setIsDarkMode((mode) => !mode)}
                      title='Toggle dark mode'>
                      {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                  </button>
                  {!user ? (
                      <button className='sign-in-btn' onClick={() => setOpenSignInModal(true)}>
                          <LogIn size={18} />
                          <span>Sign in</span>
                      </button>
                  ) : (
                      <button className='sign-out-btn' onClick={() => logout()}>
                          <LogOut size={18} />
                          <span>Sign out</span>
                      </button>
                  )}
              </div>
          </nav>

          <main className={`app-main ${isDarkMode ? "dark" : ""}`}>
              {
                isHomeView && 

                    <Home 
                        activeTab={currentView} 
                        openAuthModal={()=> setOpenSignInModal(true)}
                    />
              }
              {
                isDashboardView && 
                
                     <Dashboard />
              }
          </main>

          {openSignInModal && !user && (
              <ModalPortal>
                  <AuthModal
                      onModalClose={() => setOpenSignInModal(false)}
                      onSignUpOrIn={(userData) => setUser(userData)}
                      onMigrateGuest={() => {
                          if (isGuest) {
                              migrateGuest()
                          }
                      }}
                  />
              </ModalPortal>
          )}
      </div>
  )
}

