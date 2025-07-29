import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    // No Authorization header, no localStorage
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
      const isAuthCheckEndpoint = error.config?.url?.includes('/auth/me');
      
      if (typeof window !== "undefined" && !isAuthCheckEndpoint) {
        window.dispatchEvent(new CustomEvent("auth-logout"))
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
