import axios from 'axios'
import type { ApiResponse } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    
    const message = error.response?.data?.message || error.message || '請求失敗'
    return Promise.reject(new Error(message))
  }
)

export const createApiResponse = <T>(data: T, success: boolean = true, message: string = ''): ApiResponse<T> => {
  return {
    success,
    message,
    data
  }
}