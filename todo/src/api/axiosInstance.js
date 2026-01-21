import axios from "axios"

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const guestId = localStorage.getItem("guestId")

    if (!config.headers?.Authorization && guestId) {
        config.headers["x-guest-id"] = guestId
    }

    return config
})

