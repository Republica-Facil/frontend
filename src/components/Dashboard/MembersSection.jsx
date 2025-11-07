import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faUser } from '@fortawesome/free-solid-svg-icons'

function MembersSection({ selectedRepublic, onMembersChange }) {
  const [members, setMembers] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    telephone: '',
    quarto_id: ''
  })
  const [formError, setFormError] = useState('')

  // Buscar membros
  const fetchMembers = async () => {
    if (!selectedRepublic) return

    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/membros/${selectedRepublic}`)
      // Backend retorna { members: [...] }
      setMembers(response.data.members || [])
    } catch (err) {
      console.error('Erro ao buscar membros:', err)
      setError(err.response?.data?.detail || 'Erro ao carregar membros')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar quartos
  const fetchRooms = async () => {
    if (!selectedRepublic) return

    try {
      const response = await api.get(`/quartos/?republica_id=${selectedRepublic}`)
      setRooms(response.data.quartos || [])
    } catch (err) {
      console.error('Erro ao buscar quartos:', err)
      setRooms([])
    }
  }

  useEffect(() => {
    fetchMembers()
    fetchRooms()
  }, [selectedRepublic])

  // Abrir modal para adicionar
  const handleAddClick = () => {
    setEditingMember(null)
    setFormData({ fullname: '', email: '', telephone: '', quarto_id: '' })
    setFormError('')
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEditClick = (member) => {
    setEditingMember(member)
    setFormData({
      fullname: member.fullname,
      email: member.email,
      telephone: member.telephone,
      quarto_id: member.quarto_id || ''
    })
    setFormError('')
    setShowModal(true)
  }

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setFormData({ fullname: '', email: '', telephone: '', quarto_id: '' })
    setFormError('')
  }

  // Salvar membro (criar ou editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validação
    if (!formData.fullname.trim() || !formData.email.trim() || !formData.telephone.trim()) {
      setFormError('Nome, email e telefone são obrigatórios')
      return
    }

    if (!formData.quarto_id) {
      setFormError('Selecione um quarto para o membro')
      return
    }

    try {
      if (editingMember) {
        // Editar membro existente (sem alterar quarto)
        await api.put(`/membros/${selectedRepublic}/${editingMember.id}`, {
          fullname: formData.fullname,
          email: formData.email,
          telephone: formData.telephone
        })
      } else {
        // Criar novo membro (com quarto)
        await api.post(`/membros/${selectedRepublic}`, {
          fullname: formData.fullname,
          email: formData.email,
          telephone: formData.telephone,
          quarto_id: parseInt(formData.quarto_id)
        })
      }

      // Recarregar lista
      await fetchMembers()
      
      // Atualizar contagem de membros
      if (onMembersChange) {
        onMembersChange(selectedRepublic)
      }
      
      handleCloseModal()
    } catch (err) {
      console.error('Erro ao salvar membro:', err)
      setFormError(err.response?.data?.detail || 'Erro ao salvar membro')
    }
  }

  // Excluir membro
  const handleDeleteClick = (member) => {
    setMemberToDelete(member)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return

    try {
      await api.delete(`/membros/${selectedRepublic}/${memberToDelete.id}`)
      await fetchMembers()
      
      // Atualizar contagem de membros
      if (onMembersChange) {
        onMembersChange(selectedRepublic)
      }
      
      setShowDeleteModal(false)
      setMemberToDelete(null)
    } catch (err) {
      console.error('Erro ao excluir membro:', err)
      setError(err.response?.data?.detail || 'Erro ao excluir membro')
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setMemberToDelete(null)
  }

  if (!selectedRepublic) {
    return (
      <div className="empty-state">
        <h3>Selecione uma república</h3>
        <p>Escolha uma república para visualizar os membros.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando membros...</p>
      </div>
    )
  }

  return (
    <div className="members-section">
      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content modal-small modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Excluir Membro</h2>
              <button className="modal-close" onClick={handleCancelDelete}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-icon">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <p className="confirm-message">
                Tem certeza que deseja excluir <strong>{memberToDelete?.fullname}</strong>?
              </p>
              <p className="confirm-warning">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={handleCancelDelete}>
                Cancelar
              </button>
              <button type="button" className="btn-delete-confirm" onClick={handleConfirmDelete}>
                <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem' }} />
                Excluir Membro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar Membro */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Editar Membro' : 'Adicionar Membro'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label htmlFor="fullname">Nome Completo *</label>
                <input
                  type="text"
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Telefone *</label>
                <input
                  type="tel"
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  required
                />
              </div>

              {!editingMember && (
                <div className="form-group">
                  <label htmlFor="quarto_id">Quarto *</label>
                  <select
                    id="quarto_id"
                    value={formData.quarto_id}
                    onChange={(e) => setFormData({ ...formData, quarto_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione um quarto...</option>
                    {rooms.map(room => {
                      const occupant = members.find(m => m.quarto_id === room.id)
                      return (
                        <option key={room.id} value={room.id} disabled={!!occupant}>
                          Quarto {room.numero} {occupant ? `(Ocupado por ${occupant.fullname})` : '(Disponível)'}
                        </option>
                      )
                    })}
                  </select>
                  <small className="form-hint">
                    Quartos ocupados não podem ser selecionados.
                  </small>
                </div>
              )}

              {editingMember && (
                <div className="form-group">
                  <label>Quarto Atual</label>
                  <input
                    type="text"
                    value={formData.quarto_id ? `Quarto ${rooms.find(r => r.id === formData.quarto_id)?.numero || formData.quarto_id}` : 'Sem quarto'}
                    readOnly
                  />
                  <small className="form-hint">
                    Use a seção "Quartos" para transferir o membro para outro quarto.
                  </small>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingMember ? 'Salvar Alterações' : 'Adicionar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2>Membros da República</h2>
        <button className="btn-add" onClick={handleAddClick}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
          Adicionar Membro
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {members.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faUser} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>Nenhum membro encontrado</h3>
          <p>Adicione membros para começar a gerenciar a república.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Quarto</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const room = rooms.find(r => r.id === member.quarto_id)
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="member-name">
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem', color: '#0050C3' }} />
                        {member.fullname}
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.telephone}</td>
                    <td>{room ? `Quarto ${room.numero}` : 'Sem quarto'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditClick(member)}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(member)}
                          title="Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MembersSection
