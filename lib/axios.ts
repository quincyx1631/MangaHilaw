import axios from "axios"
import { secureStorage } from "./secure-storage"

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

const silentAxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = secureStorage.getToken()
    if (token && !secureStorage.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      secureStorage.clear()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-logout"))
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
export { silentAxiosInstance }
