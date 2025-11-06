import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import './Auth.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Todos os campos são obrigatórios')
      return false
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido')
      return false
    }

    // Validação de telefone (formato brasileiro)
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Telefone inválido. Use o formato: (11) 98765-4321')
      return false
    }

    // Validação de senha - mínimo 8 caracteres
    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return false
    }

    // Validação de senha - deve conter letra maiúscula
    if (!/[A-Z]/.test(formData.password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula')
      return false
    }

    // Validação de senha - deve conter letra minúscula
    if (!/[a-z]/.test(formData.password)) {
      setError('A senha deve conter pelo menos uma letra minúscula')
      return false
    }

    // Validação de senha - deve conter número
    if (!/[0-9]/.test(formData.password)) {
      setError('A senha deve conter pelo menos um número')
      return false
    }

    // Validação de senha - deve conter caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setError('A senha deve conter pelo menos um caractere especial (!@#$%^&*)')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/users', {
        fullname: formData.name,
        email: formData.email,
        telephone: formData.phone,
        password: formData.password
      })

      // Salvar token no localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Redirecionar para dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Erro ao criar conta. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="back-link">← Voltar</Link>
        
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FontAwesomeIcon icon={faHome} />
            </div>
            <span className="auth-logo-text">República Fácil</span>
          </div>
          <h1>Criar Conta</h1>
          <p>Comece a gerenciar sua república hoje</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="João Silva"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="joao@universidade.edu.br"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="(11) 98765-4321"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Deve conter: 8+ caracteres, maiúscula, minúscula, número e caractere especial
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
