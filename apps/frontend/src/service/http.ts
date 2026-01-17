import type { AxiosInstance, AxiosRequestConfig } from 'axios'

import axios from 'axios'

interface AxiosResponseUnwrap<T = any> extends Promise<T> { }

interface AxiosInstanceUnwrap extends AxiosInstance {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosResponseUnwrap<T>
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => AxiosResponseUnwrap<T>
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => AxiosResponseUnwrap<T>
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosResponseUnwrap<T>
}
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
}) as AxiosInstanceUnwrap

api.interceptors.response.use(
  response => response.data,
  (error) => {
    throw error.response.data
  },
)
