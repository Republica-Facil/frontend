import { useState } from 'react'
import api from '../../services/api'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons'

function CreateRepublicModal({ showModal, onClose, onRepublicCreated, republicas }) {
  const [loadingCep, setLoadingCep] = useState(false)
  const [newRepublic, setNewRepublic] = useState({
    nome: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  })
  const [formError, setFormError] = useState('')

  // Buscar CEP na API ViaCEP
  const buscarCep = async () => {
    const cep = newRepublic.cep.replace(/\D/g, '')
    
    if (cep.length !== 8) {
      setFormError('CEP deve conter 8 dígitos')
      return
    }

    setLoadingCep(true)
    setFormError('')

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      
      if (response.data.erro) {
        setFormError('CEP não encontrado')
        return
      }

      setNewRepublic(prev => ({
        ...prev,
        rua: response.data.logradouro || '',
        bairro: response.data.bairro || '',
        cidade: response.data.localidade || '',
        estado: response.data.uf || ''
      }))
    } catch (error) {
      setFormError('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoadingCep(false)
    }
  }

  // Formatar CEP enquanto digita
  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 8) value = value.slice(0, 8)
    
    // Formatar: 00000-000
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`
    }
    
    setNewRepublic(prev => ({ ...prev, cep: value }))
  }

  // Criar nova república
  const handleCreateRepublic = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validação de campos obrigatórios
    if (!newRepublic.nome.trim()) {
      setFormError('Nome da república é obrigatório')
      return
    }

    if (!newRepublic.cep.trim()) {
      setFormError('CEP é obrigatório')
      return
    }

    if (!newRepublic.rua.trim()) {
      setFormError('Por favor, busque o CEP para preencher o endereço')
      return
    }

    if (!newRepublic.numero.trim()) {
      setFormError('Número é obrigatório')
      return
    }

    if (!newRepublic.bairro.trim()) {
      setFormError('Por favor, busque o CEP para preencher o endereço')
      return
    }

    if (!newRepublic.cidade.trim()) {
      setFormError('Por favor, busque o CEP para preencher o endereço')
      return
    }

    if (!newRepublic.estado.trim()) {
      setFormError('Por favor, busque o CEP para preencher o endereço')
      return
    }

    // Verificar se nome já existe
    if (republicas.some(r => r.nome.toLowerCase() === newRepublic.nome.toLowerCase())) {
      setFormError('Já existe uma república com este nome')
      return
    }

    try {
      // Enviar para o backend
      const republicaData = {
        nome: newRepublic.nome,
        cep: newRepublic.cep.replace(/\D/g, ''), // Remove formatação
        rua: newRepublic.rua,
        numero: newRepublic.numero,
        complemento: newRepublic.complemento || null,
        bairro: newRepublic.bairro,
        cidade: newRepublic.cidade,
        estado: newRepublic.estado
      }

      const response = await api.post('/republicas/', republicaData)

      // Adicionar a nova república à lista local
      const novaRepublica = {
        id: response.data.id,
        nome: response.data.nome,
        membros: response.data.membros || 1,
        endereco: {
          cep: response.data.cep,
          rua: response.data.rua,
          numero: response.data.numero,
          complemento: response.data.complemento,
          bairro: response.data.bairro,
          cidade: response.data.cidade,
          estado: response.data.estado
        }
      }

      // Chamar callback com a nova república
      onRepublicCreated(novaRepublica)
      
      // Resetar formulário e fechar modal
      handleClose()
    } catch (error) {
      console.error('Erro ao criar república:', error)
      if (error.response?.data?.detail) {
        setFormError(error.response.data.detail)
      } else {
        setFormError('Erro ao criar república. Tente novamente.')
      }
    }
  }

  const handleClose = () => {
    setFormError('')
    setNewRepublic({
      nome: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    })
    onClose()
  }

  if (!showModal) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar Nova República</h2>
          <button className="modal-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleCreateRepublic} className="modal-form">
          {formError && <div className="error-message">{formError}</div>}

          <div className="form-group">
            <label htmlFor="nome">Nome da República *</label>
            <input
              type="text"
              id="nome"
              value={newRepublic.nome}
              onChange={(e) => setNewRepublic({ ...newRepublic, nome: e.target.value })}
              placeholder="Ex: República Central"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="cep">CEP *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="cep"
                  value={newRepublic.cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
                <button 
                  type="button" 
                  className="btn-search-cep"
                  onClick={buscarCep}
                  disabled={loadingCep || newRepublic.cep.length < 9}
                >
                  <FontAwesomeIcon icon={faSearch} />
                  {loadingCep ? ' Buscando...' : ' Buscar'}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rua">Rua *</label>
            <input
              type="text"
              id="rua"
              value={newRepublic.rua}
              onChange={(e) => setNewRepublic({ ...newRepublic, rua: e.target.value })}
              placeholder="Nome da rua"
              readOnly
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="numero">Número *</label>
              <input
                type="text"
                id="numero"
                value={newRepublic.numero}
                onChange={(e) => setNewRepublic({ ...newRepublic, numero: e.target.value })}
                placeholder="123"
                required
              />
            </div>

            <div className="form-group flex-2">
              <label htmlFor="complemento">Complemento</label>
              <input
                type="text"
                id="complemento"
                value={newRepublic.complemento}
                onChange={(e) => setNewRepublic({ ...newRepublic, complemento: e.target.value })}
                placeholder="Apto, casa, etc"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bairro">Bairro *</label>
            <input
              type="text"
              id="bairro"
              value={newRepublic.bairro}
              onChange={(e) => setNewRepublic({ ...newRepublic, bairro: e.target.value })}
              placeholder="Bairro"
              readOnly
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-3">
              <label htmlFor="cidade">Cidade *</label>
              <input
                type="text"
                id="cidade"
                value={newRepublic.cidade}
                onChange={(e) => setNewRepublic({ ...newRepublic, cidade: e.target.value })}
                placeholder="Cidade"
                readOnly
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="estado">UF *</label>
              <input
                type="text"
                id="estado"
                value={newRepublic.estado}
                onChange={(e) => setNewRepublic({ ...newRepublic, estado: e.target.value })}
                placeholder="UF"
                maxLength={2}
                readOnly
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Criar República
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRepublicModal
