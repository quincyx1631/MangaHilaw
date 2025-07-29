import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

const silentAxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
})

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-logout"))
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
export { silentAxiosInstance }
