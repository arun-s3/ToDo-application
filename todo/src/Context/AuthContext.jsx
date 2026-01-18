import { createContext, useContext, useEffect, useState } from "react"

import { api } from "../api/axiosInstance"
import { toast } from 'sonner'

const AuthContext = createContext()


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(true)
  const [guestId, setGuestId] = useState(null)
 
  const [authReady, setAuthReady] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  const loadUserAsGuest = ()=> {
    let currentGuestId = localStorage.getItem("guestId")
    console.log("GuestId extracted----->", currentGuestId)
    if (!currentGuestId) {
      console.log("No guestId available, hence generating new one...")
      currentGuestId = crypto.randomUUID()
      localStorage.setItem("guestId", currentGuestId);
      localStorage.setItem("hasSeenDemoTask", "false")
    }
    setIsGuest(true)
    setGuestId(currentGuestId)
    setUser(null)
    setAuthReady(true)
  }

  const loadUser = async () => {
    try {
      console.log("Inside loadUser()...")
      const response = await api.get(`/user`)
      if(response.status === 200){
        localStorage.removeItem("guestId")   
        setUser(response.data.user)
        setIsGuest(false)
        setGuestId(null)
        setAuthReady(true)
      }else{
        console.log("Going to loadUserAsGuest()...")
        loadUserAsGuest()
      }
    }
    catch {
      setUser(null)
      loadUserAsGuest()
    }
    finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    console.log("User in AuthContext--->", user)
    console.log("isGuest in AuthContext--->", isGuest)
    console.log("guestId in AuthContext--->", guestId)
  }, [user, isGuest, guestId])

  const migrateGuest = async()=> {
    if (!authReady) return  
    let hasSeenDemoTask = false
    if (localStorage.getItem("hasSeenDemoTask") === "true") {
        hasSeenDemoTask = true
    }
    
    await api.post(`/tasks/migrate-guest`, { guestId: localStorage.getItem("guestId"), hasSeenDemoTask })

    localStorage.removeItem("guestId")
    setGuestId(null)
    setIsGuest(false)
  }

  const logout = async () => {
    try{
      const response = await api.get(`/signout`)
      if(response.status === 200){
        loadUserAsGuest()
      }
    }
    catch(error){
      console.log("Error while logging out")
      toast.error("Error while logging out. Please check your network")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isGuest,
        guestId,
        logout,
        migrateGuest,
        authReady,
        authLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
