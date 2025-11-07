import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faFileAlt,
  faCalendar,
  faFilter,
  faDownload,
  faMoneyBill,
  faChartLine,
  faReceipt,
  faHistory
} from '@fortawesome/free-solid-svg-icons'

function ReportsSection({ selectedRepublic }) {
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtros
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mapeamento de categorias
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
      const allExpenses = response.data.despesas || []
      setExpenses(allExpenses)
      setFilteredExpenses(allExpenses)
    } catch (err) {
      console.error('Erro ao buscar despesas:', err)
      if (err.response?.status === 404) {
        setExpenses([])
        setFilteredExpenses([])
      } else {
        setError(err.response?.data?.detail || 'Erro ao carregar relatório')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [selectedRepublic])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...expenses]

    // Filtro por período
    if (startDate) {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.data_vencimento)
        const start = new Date(startDate)
        return expDate >= start
      })
    }

    if (endDate) {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.data_vencimento)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Incluir o dia todo
        return expDate <= end
      })
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exp => exp.categoria === selectedCategory)
    }

    setFilteredExpenses(filtered)
  }, [startDate, endDate, selectedCategory, expenses])

  // Calcular totais
  const calculateTotals = () => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.valor_total, 0)
    const paid = filteredExpenses.filter(exp => exp.status.toLowerCase() === 'pago')
    const totalPaid = paid.reduce((sum, exp) => sum + exp.valor_total, 0)
    const pending = total - totalPaid

    return {
      total,
      totalPaid,
      pending,
      count: filteredExpenses.length,
      paidCount: paid.length
    }
  }

  const totals = calculateTotals()

  // Formatar data (apenas data, sem conversão de timezone)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    // Parse da data em UTC
    const date = new Date(dateString)
    
    // Retorna apenas a data sem conversão de timezone
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Exportar para CSV
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    // Cabeçalho do CSV
    const headers = ['Data Vencimento', 'Descrição', 'Categoria', 'Valor Total', 'Status']
    
    // Dados
    const rows = filteredExpenses.map(exp => [
      formatDate(exp.data_vencimento),
      exp.descricao,
      categories[exp.categoria] || exp.categoria,
      formatCurrency(exp.valor_total),
      exp.status.toLowerCase() === 'pago' ? 'Pago' : 
      exp.status.toLowerCase() === 'vencida' ? 'Vencida' : 'Pendente'
    ])

    // Adicionar linha de totais
    rows.push([])
    rows.push(['TOTAIS', '', '', '', ''])
    rows.push(['Total Geral', '', '', formatCurrency(totals.total), ''])
    rows.push(['Total Pago', '', '', formatCurrency(totals.totalPaid), ''])
    rows.push(['Total Pendente', '', '', formatCurrency(totals.pending), ''])
    rows.push(['Quantidade de Despesas', '', '', totals.count, ''])

    // Converter para CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const fileName = `relatorio_despesas_${startDate || 'inicio'}_${endDate || 'fim'}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Limpar filtros
  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setSelectedCategory('all')
  }

  if (!selectedRepublic) {
    return (
      <div className="empty-state">
        <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
        <h3>Selecione uma república</h3>
        <p>Escolha uma república para visualizar os relatórios.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando relatório...</p>
      </div>
    )
  }

  return (
    <div className="reports-section">
      {/* Cabeçalho */}
      <div className="section-header">
        <div>
          <h2>Relatório e Histórico Financeiro</h2>
          <p className="section-description">
            Acesse o histórico de despesas dos meses anteriores para analisar a evolução dos gastos da república.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filtros */}
      <div className="reports-filters">
        <h3>
          <FontAwesomeIcon icon={faFilter} style={{ marginRight: '0.5rem' }} />
          Filtros
        </h3>
        
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="start-date">
              <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
              Período de Datas (início):
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="end-date">
              <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
              Período de Datas (fim):
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">
              <FontAwesomeIcon icon={faReceipt} style={{ marginRight: '0.5rem' }} />
              Categoria:
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas as Categorias</option>
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-secondary" onClick={clearFilters}>
              Limpar Filtros
            </button>
            <button className="btn-download" onClick={exportToCSV} disabled={filteredExpenses.length === 0}>
              <FontAwesomeIcon icon={faDownload} style={{ marginRight: '0.5rem' }} />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="reports-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBill} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Valor Total</span>
            <span className="stat-value">{formatCurrency(totals.total)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Pago</span>
            <span className="stat-value green">{formatCurrency(totals.totalPaid)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FontAwesomeIcon icon={faReceipt} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Pendente</span>
            <span className="stat-value orange">{formatCurrency(totals.pending)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Quantidade de Despesas</span>
            <span className="stat-value">{totals.count}</span>
          </div>
        </div>
      </div>

      {/* Tabela de Despesas */}
      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>Nenhuma despesa encontrada</h3>
          <p>
            {expenses.length === 0 
              ? 'Ainda não há despesas registradas para esta república.'
              : 'Nenhuma despesa corresponde aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="reports-table-container">
          <h3>
            <FontAwesomeIcon icon={faReceipt} style={{ marginRight: '0.5rem' }} />
            Lista Filtrada ({filteredExpenses.length} {filteredExpenses.length === 1 ? 'despesa' : 'despesas'})
          </h3>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Data Vencimento</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses
                .sort((a, b) => new Date(b.data_vencimento) - new Date(a.data_vencimento))
                .map(expense => (
                  <tr key={expense.id}>
                    <td>
                      <div className="date-cell">
                        <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem', color: '#6b7280' }} />
                        {formatDate(expense.data_vencimento)}
                      </div>
                    </td>
                    <td className="description-cell">{expense.descricao}</td>
                    <td>
                      <span className="category-badge-small">{categories[expense.categoria] || expense.categoria}</span>
                    </td>
                    <td className="value-cell">
                      <strong>{formatCurrency(expense.valor_total)}</strong>
                    </td>
                    <td>
                      {(() => {
                        const status = expense.status.toLowerCase()
                        if (status === 'pago') {
                          return (
                            <span className="status-badge-small paid">
                              Pago
                            </span>
                          )
                        } else if (status === 'vencida') {
                          return (
                            <span className="status-badge-small overdue">
                              Vencida
                            </span>
                          )
                        } else {
                          return (
                            <span className="status-badge-small pending">
                              Pendente
                            </span>
                          )
                        }
                      })()}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan="3"><strong>TOTAIS</strong></td>
                <td className="value-cell"><strong>{formatCurrency(totals.total)}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default ReportsSection
