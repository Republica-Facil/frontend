import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faMoneyBill, 
  faUser, 
  faCalendar, 
  faReceipt,
  faCheckCircle,
  faExclamationCircle,
  faSearch,
  faTimes,
  faChartBar,
  faEye,
  faSync
} from '@fortawesome/free-solid-svg-icons'

function PaymentsSection({ selectedRepublic }) {
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtros
  const [selectedMember, setSelectedMember] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Modal de detalhes do pagamento
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentExpense, setPaymentExpense] = useState(null)

  // Mapeamento de categorias (backend -> display)
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

  // Buscar despesas
  const fetchExpenses = async () => {
    if (!selectedRepublic) return

    try {
      const response = await api.get(`/despesas/${selectedRepublic}`)
      setExpenses(response.data.despesas || [])
    } catch (err) {
      console.error('Erro ao buscar despesas:', err)
    }
  }

  // Buscar todos os pagamentos (de todas as despesas)
  const fetchAllPayments = async () => {
    if (!selectedRepublic) return

    try {
      setLoading(true)
      setError('')
      
      // Primeiro buscar todas as despesas
      const expensesResponse = await api.get(`/despesas/${selectedRepublic}`)
      const allExpenses = expensesResponse.data.despesas || []
      setExpenses(allExpenses)

      // Depois buscar os pagamentos de cada despesa
      const paymentsPromises = allExpenses.map(expense =>
        api.get(`/despesas/${selectedRepublic}/${expense.id}/pagamentos`)
          .then(res => ({
            despesaId: expense.id,
            despesaDescricao: expense.descricao,
            despesaCategoria: expense.categoria,
            despesaStatus: expense.status,
            despesaVencimento: expense.data_vencimento,
            pagamentos: res.data.pagamentos || []
          }))
          .catch(() => ({ 
            despesaId: expense.id, 
            despesaDescricao: expense.descricao,
            despesaCategoria: expense.categoria,
            despesaStatus: expense.status,
            despesaVencimento: expense.data_vencimento,
            pagamentos: [] 
          }))
      )

      const paymentsResults = await Promise.all(paymentsPromises)
      
      // Achatar array de pagamentos e adicionar info da despesa
      const flatPayments = paymentsResults.flatMap(result =>
        result.pagamentos.map(payment => ({
          ...payment,
          despesa_descricao: result.despesaDescricao,
          despesa_categoria: result.despesaCategoria,
          despesa_status: result.despesaStatus ? result.despesaStatus.toLowerCase() : 'pendente',
          despesa_vencimento: result.despesaVencimento
        }))
      )
      
      setAllPayments(flatPayments)
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err)
      setError(err.response?.data?.detail || 'Erro ao carregar pagamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
    fetchAllPayments()
  }, [selectedRepublic])

  // Abrir detalhes do pagamento
  const handleShowPaymentDetails = async (payment) => {
    try {
      // Buscar a despesa atualizada para garantir que temos o status mais recente
      const response = await api.get(`/despesas/${selectedRepublic}/${payment.despesa_id}`)
      setPaymentExpense(response.data)
      setSelectedPayment({
        ...payment,
        despesa_status: response.data.status.toLowerCase()
      })
      setShowPaymentDetails(true)
    } catch (err) {
      console.error('Erro ao buscar detalhes da despesa:', err)
      setError('Erro ao carregar detalhes')
    }
  }

  // Obter nome do membro por ID
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.fullname : 'Desconhecido'
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

  // Determinar status real da despesa baseado na data de vencimento
  const getExpenseStatus = (payment) => {
    // Primeiro verifica o status que veio do backend
    const status = payment.despesa_status ? payment.despesa_status.toLowerCase() : 'pendente'
    
    // Se já está pago (todos os membros pagaram), retorna pago
    if (status === 'pago') {
      return 'pago'
    }
    
    // Para despesas que ainda não estão totalmente pagas, 
    // verificar se está vencida baseado na data
    if (payment.despesa_vencimento) {
      const vencimento = payment.despesa_vencimento.includes('Z') || payment.despesa_vencimento.includes('+')
        ? new Date(payment.despesa_vencimento)
        : new Date(payment.despesa_vencimento + 'Z')
      
      const hoje = new Date()
      // Zera as horas para comparar apenas as datas
      hoje.setHours(0, 0, 0, 0)
      vencimento.setHours(0, 0, 0, 0)
      
      // Se passou da data de vencimento e não está pago, está vencido
      if (hoje > vencimento) {
        return 'vencida'
      }
    }
    
    // Caso contrário, está pendente
    return 'pendente'
  }

  // Filtrar pagamentos
  const filteredPayments = allPayments.filter(payment => {
    const memberFilter = selectedMember === 'all' || payment.membro_id === parseInt(selectedMember)
    
    // Usar status calculado baseado na data de vencimento
    const paymentStatus = getExpenseStatus(payment)
    const selectedStatusLower = selectedStatus.toLowerCase()
    const statusFilter = selectedStatus === 'all' || paymentStatus === selectedStatusLower
    
    return memberFilter && statusFilter
  })

  // Calcular estatísticas
  const calculateStats = () => {
    const totalPaid = filteredPayments.reduce((sum, p) => sum + p.valor_pago, 0)
    const totalPayments = filteredPayments.length
    const memberPayments = {}

    filteredPayments.forEach(payment => {
      if (!memberPayments[payment.membro_id]) {
        memberPayments[payment.membro_id] = {
          count: 0,
          total: 0
        }
      }
      memberPayments[payment.membro_id].count++
      memberPayments[payment.membro_id].total += payment.valor_pago
    })

    return { totalPaid, totalPayments, memberPayments }
  }

  const stats = calculateStats()

  if (!selectedRepublic) {
    return (
      <div className="empty-state">
        <h3>Selecione uma república</h3>
        <p>Escolha uma república para visualizar os pagamentos.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando pagamentos...</p>
      </div>
    )
  }

  return (
    <div className="payments-section">
      {/* Modal Detalhes do Pagamento */}
      {showPaymentDetails && selectedPayment && paymentExpense && (
        <div className="modal-overlay" onClick={() => setShowPaymentDetails(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Pagamento</h2>
              <button className="modal-close" onClick={() => setShowPaymentDetails(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-detail-card">
                <div className="payment-detail-section">
                  <h3>Informações do Pagamento</h3>
                  <div className="payment-detail-row">
                    <span className="label">Valor Pago:</span>
                    <span className="value highlight">{formatCurrency(selectedPayment.valor_pago)}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="label">Data do Pagamento:</span>
                    <span className="value">{formatDateTime(selectedPayment.data_pagamento)}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="label">Membro:</span>
                    <span className="value">{getMemberName(selectedPayment.membro_id)}</span>
                  </div>
                </div>

                <div className="payment-detail-section">
                  <h3>Informações da Despesa</h3>
                  <div className="payment-detail-row">
                    <span className="label">Descrição:</span>
                    <span className="value">{paymentExpense.descricao}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="label">Categoria:</span>
                    <span className="value">
                      <span className="category-badge-small">{categories[paymentExpense.categoria] || paymentExpense.categoria}</span>
                    </span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="label">Valor Total:</span>
                    <span className="value">{formatCurrency(paymentExpense.valor_total)}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="label">Vencimento:</span>
                    <span className="value">{formatDate(paymentExpense.data_vencimento)}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="label">Status:</span>
                    <span className="value">
                      {(() => {
                        const status = getExpenseStatus(selectedPayment)
                        if (status === 'pago') {
                          return (
                            <span className="status-badge-small paid">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              Paga
                            </span>
                          )
                        } else if (status === 'vencida') {
                          return (
                            <span className="status-badge-small overdue">
                              <FontAwesomeIcon icon={faExclamationCircle} />
                              Vencida
                            </span>
                          )
                        } else {
                          return (
                            <span className="status-badge-small pending">
                              <FontAwesomeIcon icon={faExclamationCircle} />
                              Pendente
                            </span>
                          )
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowPaymentDetails(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="section-header">
        <h2>Pagamentos dos Membros</h2>
        <button 
          className="btn-add" 
          onClick={fetchAllPayments}
          disabled={loading}
          title="Atualizar dados"
        >
          <FontAwesomeIcon icon={faSync} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Estatísticas */}
      <div className="payments-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBill} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Pago</span>
            <span className="stat-value">{formatCurrency(stats.totalPaid)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faReceipt} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total de Pagamentos</span>
            <span className="stat-value">{stats.totalPayments}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Membros Ativos</span>
            <span className="stat-value">{Object.keys(stats.memberPayments).length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartBar} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Média por Pagamento</span>
            <span className="stat-value">
              {stats.totalPayments > 0 ? formatCurrency(stats.totalPaid / stats.totalPayments) : 'R$ 0,00'}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="payments-filters">
        <div className="filter-group">
          <label htmlFor="filter-member">
            <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} />
            Filtrar por Membro:
          </label>
          <select
            id="filter-member"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="all">Todos os Membros</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.fullname}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status">
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '0.5rem' }} />
            Status da Despesa:
          </label>
          <select
            id="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="vencida">Vencido</option>
          </select>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      {filteredPayments.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faMoneyBill} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>Nenhum pagamento encontrado</h3>
          <p>
            {allPayments.length === 0 
              ? 'Ainda não há pagamentos registrados para esta república.'
              : 'Nenhum pagamento corresponde aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Membro</th>
                <th>Despesa</th>
                <th>Categoria</th>
                <th>Valor Pago</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments
                .sort((a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento))
                .map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div className="payment-date-cell">
                        <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem', color: '#6b7280' }} />
                        {formatDateTime(payment.data_pagamento)}
                      </div>
                    </td>
                    <td>
                      <div className="payment-member-cell">
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem', color: '#0050C3' }} />
                        {getMemberName(payment.membro_id)}
                      </div>
                    </td>
                    <td>{payment.despesa_descricao}</td>
                    <td>
                      <span className="category-badge-small">{categories[payment.despesa_categoria] || payment.despesa_categoria}</span>
                    </td>
                    <td className="payment-value-cell">
                      {formatCurrency(payment.valor_pago)}
                    </td>
                    <td>
                      {(() => {
                        const status = getExpenseStatus(payment)
                        if (status === 'pago') {
                          return (
                            <span className="status-badge-small paid">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              Pago
                            </span>
                          )
                        } else if (status === 'vencida') {
                          return (
                            <span className="status-badge-small overdue">
                              <FontAwesomeIcon icon={faExclamationCircle} />
                              Vencido
                            </span>
                          )
                        } else {
                          return (
                            <span className="status-badge-small pending">
                              <FontAwesomeIcon icon={faExclamationCircle} />
                              Pendente
                            </span>
                          )
                        }
                      })()}
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleShowPaymentDetails(payment)}
                        title="Ver Detalhes"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumo por Membro */}
      {filteredPayments.length > 0 && (
        <div className="member-summary-section">
          <h3>Resumo por Membro</h3>
          <div className="member-summary-grid">
            {Object.entries(stats.memberPayments).map(([memberId, data]) => (
              <div key={memberId} className="member-summary-card">
                <div className="member-summary-header">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{getMemberName(parseInt(memberId))}</span>
                </div>
                <div className="member-summary-body">
                  <div className="summary-item">
                    <span className="summary-label">Pagamentos:</span>
                    <span className="summary-value">{data.count}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total:</span>
                    <span className="summary-value highlight">{formatCurrency(data.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsSection
