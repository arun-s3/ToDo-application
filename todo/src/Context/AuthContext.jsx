import { createContext, useContext, useEffect, useState } from "react"

import { api } from "./api/apiInstance"
import { toast } from 'sonner'

const AuthContext = createContext()


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(true)
  const [guestId, setGuestId] = useState(null)

  const [authLoading, setAuthLoading] = useState(true)

  const API_URL = process.env.REACT_APP_API_URL;

  const loadUserAsGuest = ()=> {
    let currentGuestId = localStorage.getItem("guestId")
    if (!currentGuestId) {
      currentGuestId = crypto.randomUUID()
      localStorage.setItem("guestId", currentGuestId);
    }
    setIsGuest(true)
    setGuestId(currentGuestId)
    setUser(null)
  }

  const loadUser = async () => {
    try {
      const response = await api.get(`/user`)
      if(response.status === 200){
        setUser(response.data.user)
        setIsGuest(false)
        setGuestId(null)
      }else{
        loadUserAsGuest()
      }
    }
    catch {
      setUser(null)
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
  }, [user])

  const migrateGuest = async()=> {
    await api.post(`/tasks/migrate-guest`, { guestId: localStorage.getItem("guestId") });
    localStorage.removeItem("guestId")
  }

  const logout = async () => {
    try{
      const response = await api.get(`/signout`)
      if(response.status === 200){
        setUser(null)
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
        authLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
