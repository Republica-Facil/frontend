import { Navigate } from 'react-router-dom'
import api from '../services/api'

// Função para fazer logout completo (backend + frontend)
export async function performLogout() {
  try {
    // Tenta fazer logout no backend
    await api.post('http://localhost:8000/auth/logout')
  } catch (error) {
    console.error('Erro ao fazer logout no backend:', error)
  } finally {
    // Remove tokens do localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
  }
}

// Componente para rotas que só podem ser acessadas se estiver autenticado
export function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Componente para rotas que só podem ser acessadas se NÃO estiver autenticado (login, register)
export function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token')
  
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Hook para verificar se está autenticado
export function useAuth() {
  const token = localStorage.getItem('access_token')
  const tokenType = localStorage.getItem('token_type')
  
  return {
    isAuthenticated: !!token,
    token,
    tokenType,
    logout: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_type')
    },
    performLogout // Logout completo com chamada ao backend
  }
}
