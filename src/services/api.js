import axios from 'axios'

// Usar variável de ambiente se disponível, senão usa proxy em dev ou localhost como fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'http://localhost:8000' : '/api')

console.log('API_BASE_URL configurada:', API_BASE_URL)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('PROD mode:', import.meta.env.PROD)

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
      
      // Só redireciona se não estiver já na página de login
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/forgot-password')) {
        window.location.href = 'https://frontend-pcnq.onrender.com/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }
