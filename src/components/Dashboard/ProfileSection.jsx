import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faSave, faKey, faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

// Função para decodificar o token JWT e extrair dados do usuário
const getUserDataFromToken = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return null

  try {
    // JWT tem 3 partes separadas por ponto: header.payload.signature
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))
    
    return {
      userId: decodedPayload.id,
      email: decodedPayload.sub || decodedPayload.email
    }
  } catch (err) {
    console.error('Erro ao decodificar token:', err)
    return null
  }
}

function ProfileSection() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState(null)
  
  // Modal de alteração de senha
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    telephone: ''
  })

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Buscar dados do usuário atual
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Extrair user_id do token
        const tokenData = getUserDataFromToken()
        
        if (!tokenData || !tokenData.userId) {
          setError('Não foi possível identificar o usuário. Faça login novamente.')
          setLoading(false)
          return
        }
        
        // Buscar dados do usuário pelo ID
        const response = await api.get(`/users/${tokenData.userId}`)
        const userData = response.data
        
        setUserId(userData.id)
        setFormData({
          fullname: userData.fullname || '',
          email: userData.email || '',
          telephone: userData.telephone || ''
        })
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err)
        setError(err.response?.data?.detail || 'Erro ao carregar dados do perfil')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar mensagens ao editar
    setError('')
    setSuccess('')
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar mensagens ao editar
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleOpenPasswordModal = () => {
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    })
    setPasswordError('')
    setPasswordSuccess('')
    setShowPasswordModal(true)
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // Validação
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('Todos os campos são obrigatórios')
      return
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('A nova senha e a confirmação devem ser iguais')
      return
    }

    try {
      setChangingPassword(true)

      await api.patch(`/users/change-password/${userId}`, passwordData)
      
      setPasswordSuccess('Senha alterada com sucesso!')
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleClosePasswordModal()
      }, 2000)
    } catch (err) {
      console.error('Erro ao alterar senha:', err)
      setPasswordError(err.response?.data?.detail || 'Erro ao alterar senha')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validação
    if (!formData.fullname.trim() || !formData.email.trim() || !formData.telephone.trim()) {
      setError('Todos os campos são obrigatórios')
      return
    }

    try {
      setSaving(true)
      
      // Enviar apenas os dados básicos (sem senha)
      const dataToSend = {
        fullname: formData.fullname,
        email: formData.email,
        telephone: formData.telephone
      }

      await api.put(`/users/${userId}`, dataToSend)
      
      setSuccess('Perfil atualizado com sucesso!')

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      setError(err.response?.data?.detail || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="profile-section">
      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handleClosePasswordModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Alterar Senha</h2>
              <button className="modal-close" onClick={handleClosePasswordModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="modal-form">
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

              <div className="form-group">
                <label htmlFor="old_password">Senha Atual *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    id="old_password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua senha atual"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new_password">Nova Senha *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Digite a nova senha"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                <small className="form-hint">Mínimo de 8 caracteres.</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirmar Nova Senha *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Confirme a nova senha"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleClosePasswordModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={changingPassword}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: '0.5rem' }} />
                  {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="header-content">
          <FontAwesomeIcon icon={faUser} className="header-icon" />
          <div>
            <h2>Meu Perfil</h2>
            <p className="section-subtitle">Atualize suas informações pessoais</p>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullname">Nome Completo *</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Telefone *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleOpenPasswordModal}
            >
              <FontAwesomeIcon icon={faKey} style={{ marginRight: '0.5rem' }} />
              Alterar Senha
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              <FontAwesomeIcon icon={faSave} style={{ marginRight: '0.5rem' }} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileSection
