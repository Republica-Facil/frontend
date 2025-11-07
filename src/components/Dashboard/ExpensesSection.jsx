import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faTimes, 
  faMoneyBill, 
  faCheckCircle,
  faExclamationCircle,
  faUsers,
  faCalendar
} from '@fortawesome/free-solid-svg-icons'

function ExpensesSection({ selectedRepublic }) {
  const [expenses, setExpenses] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Aba ativa (em aberto ou histórico)
  const [activeTab, setActiveTab] = useState('aberto')
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentsListModal, setShowPaymentsListModal] = useState(false)
  
  // Dados
  const [editingExpense, setEditingExpense] = useState(null)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [payments, setPayments] = useState([])
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor_total: '',
    data_vencimento: '',
    categoria: ''
  })
  
  const [paymentData, setPaymentData] = useState({
    membro_id: ''
  })
  
  const [formError, setFormError] = useState('')

  // Categorias de despesas (mapeamento para exibição)
  const categories = {
    'luz': 'Luz',
    'agua': 'Água',
    'internet': 'Internet',
    'gas': 'Gás',
    'condominio': 'Condomínio',
    'limpeza': 'Limpeza',
    'manutencao': 'Manutenção',
    'outros': 'Outros'
  }

  // Buscar despesas
  const fetchExpenses = async () => {
    if (!selectedRepublic) return

    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/despesas/${selectedRepublic}`)
      setExpenses(response.data.despesas || [])
    } catch (err) {
      console.error('Erro ao buscar despesas:', err)
      if (err.response?.status === 404) {
        setExpenses([])
      } else {
        setError(err.response?.data?.detail || 'Erro ao carregar despesas')
      }
    } finally {
      setLoading(false)
    }
  }

  // Buscar membros
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
    fetchExpenses()
    fetchMembers()
  }, [selectedRepublic])

  // Criar despesa
  const handleCreateExpense = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.descricao.trim() || !formData.valor_total || !formData.data_vencimento || !formData.categoria) {
      setFormError('Todos os campos são obrigatórios')
      return
    }

    if (parseFloat(formData.valor_total) <= 0) {
      setFormError('Valor deve ser maior que zero')
      return
    }

    try {
      await api.post(`/despesas/${selectedRepublic}`, {
        descricao: formData.descricao,
        valor_total: parseFloat(formData.valor_total),
        data_vencimento: formData.data_vencimento,
        categoria: formData.categoria
      })
      
      await fetchExpenses()
      setShowCreateModal(false)
      setFormData({ descricao: '', valor_total: '', data_vencimento: '', categoria: '' })
    } catch (err) {
      console.error('Erro ao criar despesa:', err)
      setFormError(err.response?.data?.detail || 'Erro ao criar despesa')
    }
  }

  // Editar despesa
  const handleEditExpense = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.descricao.trim() || !formData.valor_total || !formData.data_vencimento || !formData.categoria) {
      setFormError('Todos os campos são obrigatórios')
      return
    }

    if (parseFloat(formData.valor_total) <= 0) {
      setFormError('Valor deve ser maior que zero')
      return
    }

    try {
      await api.patch(`/despesas/${selectedRepublic}/${editingExpense.id}`, {
        descricao: formData.descricao,
        valor_total: parseFloat(formData.valor_total),
        data_vencimento: formData.data_vencimento,
        categoria: formData.categoria
      })
      
      await fetchExpenses()
      setShowEditModal(false)
      setEditingExpense(null)
      setFormData({ descricao: '', valor_total: '', data_vencimento: '', categoria: '' })
    } catch (err) {
      console.error('Erro ao editar despesa:', err)
      setFormError(err.response?.data?.detail || 'Erro ao editar despesa')
    }
  }

  // Excluir despesa
  const handleDeleteExpense = async () => {
    try {
      await api.delete(`/despesas/${selectedRepublic}/${expenseToDelete.id}`)
      await fetchExpenses()
      setShowDeleteModal(false)
      setExpenseToDelete(null)
    } catch (err) {
      console.error('Erro ao excluir despesa:', err)
      setError(err.response?.data?.detail || 'Erro ao excluir despesa')
    }
  }

  // Registrar pagamento
  const handleRegisterPayment = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!paymentData.membro_id) {
      setFormError('Selecione um membro')
      return
    }

    try {
      const expenseId = selectedExpense.id
      
      await api.post(`/despesas/${selectedRepublic}/${expenseId}/pagamento`, {
        membro_id: parseInt(paymentData.membro_id)
      })
      
      // Fechar modal primeiro
      setShowPaymentModal(false)
      setSelectedExpense(null)
      setPaymentData({ membro_id: '' })
      
      // Aguardar para o backend atualizar o status
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Buscar a despesa atualizada do backend
      const updatedExpenseResponse = await api.get(`/despesas/${selectedRepublic}/${expenseId}`)
      const updatedExpense = updatedExpenseResponse.data
      
      // Atualizar apenas a despesa específica no array
      setExpenses(prevExpenses => 
        prevExpenses.map(exp => 
          exp.id === expenseId ? updatedExpense : exp
        )
      )
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err)
      setFormError(err.response?.data?.detail || 'Erro ao registrar pagamento')
    }
  }

  // Listar pagamentos de uma despesa
  const handleShowPayments = async (expense) => {
    try {
      const response = await api.get(`/despesas/${selectedRepublic}/${expense.id}/pagamentos`)
      setPayments(response.data.pagamentos || [])
      setSelectedExpense(expense)
      setShowPaymentsListModal(true)
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err)
      setError(err.response?.data?.detail || 'Erro ao buscar pagamentos')
    }
  }

  // Abrir modais
  const openCreateModal = () => {
    setFormData({ descricao: '', valor_total: '', data_vencimento: '', categoria: '' })
    setFormError('')
    setShowCreateModal(true)
  }

  const openEditModal = (expense) => {
    setEditingExpense(expense)
    
    // Converter a data para o formato correto do input date (YYYY-MM-DD)
    let dateValue = expense.data_vencimento
    if (dateValue.includes('T')) {
      dateValue = dateValue.split('T')[0]
    }
    
    setFormData({
      descricao: expense.descricao,
      valor_total: expense.valor_total,
      data_vencimento: dateValue,
      categoria: expense.categoria
    })
    setFormError('')
    setShowEditModal(true)
  }

  const openDeleteModal = (expense) => {
    setExpenseToDelete(expense)
    setShowDeleteModal(true)
  }

  const openPaymentModal = (expense) => {
    setSelectedExpense(expense)
    setPaymentData({ membro_id: '' })
    setFormError('')
    setShowPaymentModal(true)
  }

  // Calcular valor por membro
  const getValuePerMember = (totalValue) => {
    if (members.length === 0) return 0
    return (totalValue / members.length).toFixed(2)
  }

  // Formatar data (apenas data, sem conversão de timezone)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    // Parse da data em UTC
    const date = new Date(dateString)
    
    // Retorna apenas a data sem conversão de timezone
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  // Formatar data e hora (converte hora para UTC-3)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    
    // Parse da data mantendo UTC
    const date = dateString.includes('Z') || dateString.includes('+') 
      ? new Date(dateString) 
      : new Date(dateString + 'Z')
    
    // Converte apenas a HORA para timezone América/São Paulo (UTC-3)
    return date.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Verificar se despesa está vencida
  const isOverdue = (dueDate, status) => {
    if (status === 'PAGO') return false
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
  }

    // Determinar status real da despesa baseado na data de vencimento
  const getExpenseStatus = (expense) => {
    const status = expense.status ? expense.status.toLowerCase() : 'pendente'
    
    // Se já está pago, retorna pago
    if (status === 'pago') {
      return 'pago'
    }
    
    // Verificar se está vencido
    if (expense.data_vencimento) {
      const vencimento = expense.data_vencimento.includes('Z') || expense.data_vencimento.includes('+')
        ? new Date(expense.data_vencimento)
        : new Date(expense.data_vencimento + 'Z')
      
      const hoje = new Date()
      // Zera as horas para comparar apenas as datas
      hoje.setHours(0, 0, 0, 0)
      vencimento.setHours(0, 0, 0, 0)
      
      // Se passou da data de vencimento, está vencido
      if (hoje > vencimento) {
        return 'vencida'
      }
    }
    
    // Caso contrário, está pendente
    return 'pendente'
  }

  // Obter nome do membro por ID
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.fullname : 'Desconhecido'
  }

  // Filtrar e ordenar despesas
  const getFilteredAndSortedExpenses = () => {
    // Separar despesas pagas e em aberto
    const paidExpenses = expenses.filter(exp => getExpenseStatus(exp) === 'pago')
    const openExpenses = expenses.filter(exp => getExpenseStatus(exp) !== 'pago')

    // Ordenar em aberto por data de vencimento (ascendente - mais antiga primeiro)
    const sortedOpen = openExpenses.sort((a, b) => {
      const dateA = new Date(a.data_vencimento)
      const dateB = new Date(b.data_vencimento)
      return dateA - dateB
    })

    // Ordenar pagas por data de vencimento (descendente - mais recente primeiro)
    const sortedPaid = paidExpenses.sort((a, b) => {
      const dateA = new Date(a.data_vencimento)
      const dateB = new Date(b.data_vencimento)
      return dateB - dateA
    })

    return { openExpenses: sortedOpen, paidExpenses: sortedPaid }
  }

  const { openExpenses, paidExpenses } = getFilteredAndSortedExpenses()
  const displayExpenses = activeTab === 'aberto' ? openExpenses : paidExpenses

  if (!selectedRepublic) {
    return (
      <div className="empty-state">
        <h3>Selecione uma república</h3>
        <p>Escolha uma república para gerenciar as despesas.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando despesas...</p>
      </div>
    )
  }

  return (
    <div className="expenses-section">
      {/* Modal Criar Despesa */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Despesa</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label htmlFor="descricao">Descrição *</label>
                <input
                  type="text"
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Conta de Luz - Janeiro"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoria">Categoria *</label>
                  <select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {Object.entries(categories).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="valor_total">Valor Total (R$) *</label>
                  <input
                    type="number"
                    id="valor_total"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="data_vencimento">Data de Vencimento *</label>
                  <input
                    type="date"
                    id="data_vencimento"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Valor por Membro</label>
                  <input
                    type="text"
                    value={formData.valor_total ? formatCurrency(getValuePerMember(formData.valor_total)) : 'R$ 0,00'}
                    readOnly
                  />
                  <small className="form-hint">{members.length} {members.length === 1 ? 'membro' : 'membros'}</small>
                </div>
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

      {/* Modal Editar Despesa */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Despesa</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleEditExpense} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label htmlFor="edit_descricao">Descrição *</label>
                <input
                  type="text"
                  id="edit_descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Conta de Luz - Janeiro"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_categoria">Categoria *</label>
                  <select
                    id="edit_categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {Object.entries(categories).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit_valor_total">Valor Total (R$) *</label>
                  <input
                    type="number"
                    id="edit_valor_total"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit_data_vencimento">Data de Vencimento *</label>
                <input
                  type="date"
                  id="edit_data_vencimento"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
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

      {/* Modal Excluir Despesa */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Excluir Despesa</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-icon">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <p className="confirm-message">
                Tem certeza que deseja excluir a despesa <strong>{expenseToDelete?.descricao}</strong>?
              </p>
              <p className="confirm-warning">
                Esta ação não pode ser desfeita e todos os pagamentos associados serão perdidos.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteExpense}>
                <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem' }} />
                Excluir Despesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pagamento */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Pagamento</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="modal-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label>Despesa</label>
                <input
                  type="text"
                  value={selectedExpense?.descricao || ''}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Valor por Membro</label>
                <input
                  type="text"
                  value={selectedExpense ? formatCurrency(getValuePerMember(selectedExpense.valor_total)) : 'R$ 0,00'}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="membro_id">Selecione o Membro *</label>
                <select
                  id="membro_id"
                  value={paymentData.membro_id}
                  onChange={(e) => setPaymentData({ membro_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.fullname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.5rem' }} />
                  Registrar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lista de Pagamentos */}
      {showPaymentsListModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentsListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pagamentos - {selectedExpense?.descricao}</h2>
              <button className="modal-close" onClick={() => setShowPaymentsListModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              {payments.length === 0 ? (
                <div className="empty-state-small">
                  <p>Nenhum pagamento registrado ainda.</p>
                </div>
              ) : (
                <div className="payments-list">
                  {payments.map(payment => (
                    <div key={payment.id} className="payment-item">
                      <div className="payment-info">
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#22c55e', marginRight: '0.75rem' }} />
                        <div>
                          <strong>{getMemberName(payment.membro_id)}</strong>
                          <span className="payment-date">{formatDateTime(payment.data_pagamento)}</span>
                        </div>
                      </div>
                      <div className="payment-value">
                        {formatCurrency(payment.valor_pago)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="payment-summary">
                <p>
                  <strong>{payments.length}</strong> de <strong>{members.length}</strong> membros pagaram
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowPaymentsListModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="section-header">
        <h2>Despesas</h2>
        <button className="btn-add" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
          Adicionar Despesa
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Abas */}
      <div className="expenses-tabs">
        <button 
          className={`tab-button ${activeTab === 'aberto' ? 'active' : ''}`}
          onClick={() => setActiveTab('aberto')}
        >
          <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: '0.5rem' }} />
          Em Aberto ({openExpenses.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.5rem' }} />
          Histórico ({paidExpenses.length})
        </button>
      </div>

      {displayExpenses.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faMoneyBill} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>
            {activeTab === 'aberto' ? 'Nenhuma despesa em aberto' : 'Nenhuma despesa paga'}
          </h3>
          <p>
            {activeTab === 'aberto' 
              ? 'Comece adicionando a primeira despesa da república.' 
              : 'Despesas pagas aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="expenses-grid">
          {displayExpenses.map(expense => {
            const currentStatus = getExpenseStatus(expense)
            return (
              <div key={expense.id} className={`expense-card ${
                currentStatus === 'pago' ? 'paid' : 
                currentStatus === 'vencida' ? 'overdue' : 
                'pending'
              }`}>
                <div className="expense-header">
                  <div className="expense-category">
                    <span className="category-badge">{categories[expense.categoria] || expense.categoria}</span>
                    <span className={`status-badge ${
                      currentStatus === 'pago' ? 'paid' : 
                      currentStatus === 'vencida' ? 'overdue' : 
                      'pending'
                    }`}>
                      <FontAwesomeIcon icon={currentStatus === 'pago' ? faCheckCircle : faExclamationCircle} />
                      {currentStatus === 'pago' ? 'Pago' : 
                       currentStatus === 'vencida' ? 'Vencida' : 
                       'Pendente'}
                    </span>
                  </div>
                  <div className="expense-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEditModal(expense)}
                      title="Editar"
                      disabled={expense.status === 'pago'}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => openDeleteModal(expense)}
                      title="Excluir"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className="expense-content">
                  <h3>{expense.descricao}</h3>
                  
                  <div className="expense-details">
                    <div className="expense-value">
                      <span className="label">Valor Total:</span>
                      <span className="value">{formatCurrency(expense.valor_total)}</span>
                    </div>
                    
                    <div className="expense-value-per-member">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{formatCurrency(getValuePerMember(expense.valor_total))} por membro</span>
                    </div>

                    <div className="expense-due-date">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span>Vencimento: {formatDate(expense.data_vencimento)}</span>
                    </div>
                  </div>

                  <div className="expense-footer">
                    <button
                      className="btn-view-payments"
                      onClick={() => handleShowPayments(expense)}
                    >
                      <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.5rem' }} />
                      Ver Pagamentos
                    </button>
                    
                    {expense.status !== 'PAGO' && (
                      <button
                        className="btn-register-payment"
                        onClick={() => openPaymentModal(expense)}
                      >
                        <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: '0.5rem' }} />
                        Registrar Pagamento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExpensesSection
