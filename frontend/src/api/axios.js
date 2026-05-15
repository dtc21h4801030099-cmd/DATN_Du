import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const detail = err.response?.data?.detail

    const hasToken = !!sessionStorage.getItem('token')
    if (status === 401 && hasToken) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:expired'))
    }

    if (status === 403 && detail === 'Tài khoản đã bị khóa') {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:expired'))
    }

    return Promise.reject(err)
  },
)

export default api
