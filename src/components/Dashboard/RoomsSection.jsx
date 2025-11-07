import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faDoorOpen, faUserPlus, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

function RoomsSection({ selectedRepublic }) {
  const [rooms, setRooms] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  
  // Dados dos formulários
  const [roomNumber, setRoomNumber] = useState('')
  const [editingRoom, setEditingRoom] = useState(null)
  const [roomToDelete, setRoomToDelete] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [memberToTransfer, setMemberToTransfer] = useState(null)
  const [newRoomId, setNewRoomId] = useState('')
  
  const [formError, setFormError] = useState('')

  // Buscar quartos
  const fetchRooms = async () => {
    if (!selectedRepublic) return

    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/quartos/?republica_id=${selectedRepublic}`)
      setRooms(response.data.quartos || [])
    } catch (err) {
      console.error('Erro ao buscar quartos:', err)
      if (err.response?.status === 404) {
        setRooms([])
      } else {
        setError(err.response?.data?.detail || 'Erro ao carregar quartos')
      }
    } finally {
      setLoading(false)
    }
  }

  // Buscar membros da república
  const fetchMembers = async () => {
    if (!selectedRepublic) return

    try {
      const response = await api.get(`/membros/${selectedRepublic}`)
      setMembers(response.data.members || [])
    } catch (err) {
      console.error('Erro ao buscar membros:', err)
    }
  }

  useEffect(() => {
    fetchRooms()
    fetchMembers()
  }, [selectedRepublic])

  // Criar quarto
  const handleCreateRoom = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!roomNumber.trim()) {
      setFormError('Número do quarto é obrigatório')
      return
    }

    try {
      await api.post(`/quartos/?republica_id=${selectedRepublic}`, {
        numero: roomNumber
      })
      
      await fetchRooms()
      setShowCreateModal(false)
      setRoomNumber('')
    } catch (err) {
      console.error('Erro ao criar quarto:', err)
      setFormError(err.response?.data?.detail || 'Erro ao criar quarto')
    }
  }

  // Editar quarto
  const handleEditRoom = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!roomNumber.trim()) {
      setFormError('Número do quarto é obrigatório')
      return
    }

    try {
      await api.patch(
        `/quartos/${editingRoom.id}?republica_id=${selectedRepublic}`,
        { numero: roomNumber }
      )
      
      await fetchRooms()
      setShowEditModal(false)
      setEditingRoom(null)
      setRoomNumber('')
    } catch (err) {
      console.error('Erro ao editar quarto:', err)
      setFormError(err.response?.data?.detail || 'Erro ao editar quarto')
    }
  }

  // Excluir quarto
  const handleDeleteRoom = async () => {
    try {
      await api.delete(`/quartos/${roomToDelete.id}?republica_id=${selectedRepublic}`)
      await fetchRooms()
      setShowDeleteModal(false)
      setRoomToDelete(null)
    } catch (err) {
      console.error('Erro ao excluir quarto:', err)
      setError(err.response?.data?.detail || 'Erro ao excluir quarto')
    }
  }

  // Adicionar membro ao quarto
  const handleAddMember = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedMemberId) {
      setFormError('Selecione um membro')
      return
    }

    try {
      await api.patch(`/quartos/${selectedRoom.id}/membros`, {
        membro_id: parseInt(selectedMemberId)
      })
      
      await fetchRooms()
      await fetchMembers()
      setShowAddMemberModal(false)
      setSelectedRoom(null)
      setSelectedMemberId('')
    } catch (err) {
      console.error('Erro ao adicionar membro:', err)
      setFormError(err.response?.data?.detail || 'Erro ao adicionar membro ao quarto')
    }
  }

  // Transferir membro de quarto
  const handleTransferMember = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!newRoomId) {
      setFormError('Selecione o novo quarto')
      return
    }

    // Verificar se o quarto de destino já está ocupado
    const targetRoom = getRoomMember(parseInt(newRoomId))
    if (targetRoom) {
      setFormError(`Este quarto já está ocupado por ${targetRoom.fullname}. Por favor, selecione um quarto vazio.`)
      return
    }

    try {
      await api.delete(
        `/quartos/${memberToTransfer.quarto_id}/membros/${memberToTransfer.id}?novo_quarto_id=${newRoomId}`
      )
      
      await fetchRooms()
      await fetchMembers()
      setShowTransferModal(false)
      setMemberToTransfer(null)
      setNewRoomId('')
    } catch (err) {
      console.error('Erro ao transferir membro:', err)
      
      // Tratamento específico para quarto ocupado
      if (err.response?.status === 409) {
        setFormError('⚠️ Este quarto já está ocupado. Por favor, selecione um quarto vazio.')
      } else if (err.response?.status === 404) {
        setFormError('Quarto não encontrado. Por favor, atualize a página e tente novamente.')
      } else {
        setFormError(err.response?.data?.detail || 'Erro ao transferir membro. Tente novamente.')
      }
    }
  }

  // Abrir modais
  const openCreateModal = () => {
    setRoomNumber('')
    setFormError('')
    setShowCreateModal(true)
  }

  const openEditModal = (room) => {
    setEditingRoom(room)
    setRoomNumber(room.numero)
    setFormError('')
    setShowEditModal(true)
  }

  const openDeleteModal = (room) => {
    setRoomToDelete(room)
    setShowDeleteModal(true)
  }

  const openAddMemberModal = (room) => {
    setSelectedRoom(room)
    setSelectedMemberId('')
    setFormError('')
    setShowAddMemberModal(true)
  }

  const openTransferModal = (member) => {
    setMemberToTransfer(member)
    setNewRoomId('')
    setFormError('')
    
    // Verificar se há quartos disponíveis
    const availableRooms = rooms.filter(r => r.id !== member.quarto_id && !getRoomMember(r.id))
    if (availableRooms.length === 0) {
      setFormError('Não há quartos vazios disponíveis para transferência. Todos os quartos estão ocupados.')
    }
    
    setShowTransferModal(true)
  }

  // Obter membro do quarto
  const getRoomMember = (roomId) => {
    return members.find(m => m.quarto_id === roomId)
  }

  // Obter membros sem quarto
  const getAvailableMembers = () => {
    return members.filter(m => !m.quarto_id)
  }

  if (!selectedRepublic) {
    return (
      <div className="empty-state">
        <h3>Selecione uma república</h3>
        <p>Escolha uma república para gerenciar os quartos.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando quartos...</p>
      </div>
    )
  }

  return (
    <div className="rooms-section">
      {/* Modal Criar Quarto */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Quarto</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label htmlFor="roomNumber">Número do Quarto *</label>
                <input
                  type="text"
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Ex: 101, A, Quarto 1"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Quarto */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Quarto</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleEditRoom} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label htmlFor="editRoomNumber">Número do Quarto *</label>
                <input
                  type="text"
                  id="editRoomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Ex: 101, A, Quarto 1"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <FontAwesomeIcon icon={faEdit} style={{ marginRight: '0.5rem' }} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir Quarto */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Excluir Quarto</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-icon">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <p className="confirm-message">
                Tem certeza que deseja excluir o <strong>Quarto {roomToDelete?.numero}</strong>?
              </p>
              <p className="confirm-warning">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteRoom}>
                <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem' }} />
                Excluir Quarto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Membro ao Quarto */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Membro ao Quarto {selectedRoom?.numero}</h2>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label htmlFor="memberId">Selecione o Membro *</label>
                <select
                  id="memberId"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {getAvailableMembers().map(member => (
                    <option key={member.id} value={member.id}>
                      {member.fullname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAddMemberModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '0.5rem' }} />
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transferir Membro */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transferir Membro</h2>
              <button className="modal-close" onClick={() => setShowTransferModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleTransferMember} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label>Membro</label>
                <input
                  type="text"
                  value={memberToTransfer?.fullname || ''}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="newRoomId">Novo Quarto *</label>
                <select
                  id="newRoomId"
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  required
                >
                  <option value="">Selecione um quarto vazio...</option>
                  {rooms.filter(r => r.id !== memberToTransfer?.quarto_id).map(room => {
                    const occupant = getRoomMember(room.id)
                    return (
                      <option 
                        key={room.id} 
                        value={room.id}
                        disabled={!!occupant}
                        style={{ 
                          color: occupant ? '#999' : '#000',
                          fontWeight: occupant ? 'normal' : '500'
                        }}
                      >
                        Quarto {room.numero} {occupant ? `(Ocupado por ${occupant.fullname})` : '(Disponível)'}
                      </option>
                    )
                  })}
                </select>
                <small className="form-hint">⚠️ Apenas quartos vazios estão disponíveis para transferência</small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowTransferModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <FontAwesomeIcon icon={faExchangeAlt} style={{ marginRight: '0.5rem' }} />
                  Transferir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="section-header">
        <h2>Quartos</h2>
        <button className="btn-add" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
          Adicionar Quarto
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {rooms.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faDoorOpen} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>Nenhum quarto cadastrado</h3>
          <p>Comece adicionando o primeiro quarto da república.</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map(room => {
            const member = getRoomMember(room.id)
            return (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <div className="room-number">
                    <FontAwesomeIcon icon={faDoorOpen} />
                    <span>Quarto {room.numero}</span>
                  </div>
                  <div className="room-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEditModal(room)}
                      title="Editar quarto"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => openDeleteModal(room)}
                      title="Excluir quarto"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className="room-content">
                  {member ? (
                    <div className="room-member">
                      <div className="member-info">
                        <strong>{member.fullname}</strong>
                        <span>{member.email}</span>
                        <span>{member.telephone}</span>
                      </div>
                      <button
                        className="btn-transfer"
                        onClick={() => openTransferModal(member)}
                        title="Transferir para outro quarto"
                      >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        Transferir
                      </button>
                    </div>
                  ) : (
                    <div className="room-empty">
                      <p>Quarto vazio</p>
                      <button
                        className="btn-add-member"
                        onClick={() => openAddMemberModal(room)}
                      >
                        <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '0.5rem' }} />
                        Adicionar Membro
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RoomsSection
