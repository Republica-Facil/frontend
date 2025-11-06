function SummaryCards({ resumoData }) {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-label">Total de Despesas</div>
        <div className="card-value">R$ {resumoData.totalDespesas.toLocaleString('pt-BR')}</div>
        <div className="card-detail">Este mês</div>
      </div>

      <div className="summary-card negative">
        <div className="card-label">Seu Saldo</div>
        <div className="card-value">R$ {Math.abs(resumoData.seuSaldo)}</div>
        <div className="card-detail">Valor devido</div>
      </div>

      <div className="summary-card">
        <div className="card-label">Membros da República</div>
        <div className="card-value">{resumoData.membrosAtivos}</div>
        <div className="card-detail">Moradores ativos</div>
      </div>
    </div>
  )
}

export default SummaryCards
