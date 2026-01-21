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
    if (!currentGuestId) {
      currentGuestId = crypto.randomUUID()
      localStorage.setItem("guestId", currentGuestId);
      localStorage.setItem("hasSeenDemoTask", "false")
    }
    setIsGuest(true)
    setGuestId(currentGuestId)
    setUser(null)
  }

  const loadUser = async () => {
    try {
      setAuthLoading(true)
      const response = await api.get(`/user`)
      if(response.status === 200){
        localStorage.removeItem("guestId")   
        setUser(response.data.user)
        setIsGuest(false)
        setGuestId(null)
      }else{
        loadUserAsGuest()
      }
    }
    catch {
      setUser(null)
      loadUserAsGuest()
    }
    finally {
      setAuthReady(true)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
      console.log("authLoading---->", authLoading)
  }, [authLoading])

  useEffect(() => {
      console.log("authReady---->", authReady)
  }, [authReady])

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

  const signInAndUp = async (userDetails, isSignIn) => {
      setAuthLoading(true)
      try {
          const response = await api.post(`/${isSignIn ? "signin" : "signup"}`, { userDetails })
          if (response && response?.data?.success) {
              if (isGuest) {
                  await migrateGuest()
              }
              setUser(response.data.user)
              if (!isSignIn) {
                  toast.success("Registered successfully!")
              }
              return true
          }
      } catch (error) {
          console.error("Signup/Signin error:", error)
          if (error.response?.data?.message) {
              toast.error(error.response.data.message)
          } else {
              toast.error("Something went wrong! Please check your network and retry again later.")
          }
          return false
      } finally {
        setAuthLoading(false)
      }
  }

  const logout = async () => {
    try{
      setAuthLoading(true)
      const response = await api.get(`/signout`)
      if(response.status === 200){
        loadUserAsGuest()
      }
    }
    catch(error){
      console.error("Error while logging out", error)
      toast.error("Error while logging out. Please check your network")
    } 
    finally{
        setAuthLoading(false)
    }
  }
  

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        guestId,
        signInAndUp,
        logout,
        authReady,
        authLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
