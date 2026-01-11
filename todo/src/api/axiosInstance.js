import axios from "axios"

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const guestId = localStorage.getItem("guestId")

    console.log("guestId from axiosInstance---->", guestId)
    
    if (guestId) {
      config.headers["x-guest-id"] = guestId
    }
  
    return config
})
