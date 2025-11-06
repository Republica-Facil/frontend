import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import './Auth.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: código, 3: nova senha
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = () => {
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return false
    }

    if (!/[A-Z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula')
      return false
    }

    if (!/[a-z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra minúscula')
      return false
    }

    if (!/[0-9]/.test(password)) {
      setError('A senha deve conter pelo menos um número')
      return false
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('A senha deve conter pelo menos um caractere especial (!@#$%^&*)')
      return false
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }

    return true
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await axios.post('http://localhost:8000/auth/forgot-password', {
        email: email
      })

      setSuccess('Um código de verificação foi enviado para seu email.')
      setStep(2)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Erro ao enviar email. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/auth/verify-code', {
        email: email,
        code: code
      })

      // Salvar token temporário
      setTempToken(response.data.reset_token)
      setSuccess('Código verificado! Agora defina sua nova senha.')
      setStep(3)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Código inválido ou expirado. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validatePassword()) {
      return
    }

    setLoading(true)

    try {
      await axios.patch(
        'http://localhost:8000/auth/reset-password',
        {
          new_password: password
        },
        {
          headers: {
            'Authorization': `Bearer ${tempToken}`
          }
        }
      )

      setSuccess('Senha redefinida com sucesso! Redirecionando...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Erro ao redefinir senha. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="back-link">← Voltar para Login</Link>
        
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FontAwesomeIcon icon={faHome} />
            </div>
            <span className="auth-logo-text">República Fácil</span>
          </div>
          <h1>
            {step === 1 && 'Esqueci a Senha'}
            {step === 2 && 'Verificar Código'}
            {step === 3 && 'Nova Senha'}
          </h1>
          <p>
            {step === 1 && 'Digite seu email para receber o código de verificação'}
            {step === 2 && 'Digite o código enviado para seu email'}
            {step === 3 && 'Defina sua nova senha'}
          </p>
        </div>

        {/* Passo 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="joao@universidade.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {/* Passo 2: Código */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="code">Código de Verificação</label>
              <input
                type="text"
                id="code"
                name="code"
                placeholder="Digite o código recebido"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0050C3',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

        {/* Passo 3: Nova Senha */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="password">Nova Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Deve conter: 8+ caracteres, maiúscula, minúscula, número e caractere especial
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Lembrou a senha? <Link to="/login">Fazer login</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
