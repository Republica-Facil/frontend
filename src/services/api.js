import axios from 'axios'

// Usar variável de ambiente se disponível, senão usa proxy em dev ou localhost como fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'http://localhost:8000' : '/api')

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    const tokenType = localStorage.getItem('token_type')
    
    if (token) {
      config.headers.Authorization = `${tokenType || 'Bearer'} ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_type')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }
