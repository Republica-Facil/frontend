import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

function ExpensesList({ despesasRecentes }) {
  return (
    <div className="expenses-section">
      <div className="section-header">
        <h2>Despesas Recentes</h2>
        <button className="btn-add">
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
          Adicionar Despesa
        </button>
      </div>

      <div className="expenses-list">
        {despesasRecentes.map(despesa => (
          <div key={despesa.id} className="expense-item">
            <div className="expense-info">
              <div className="expense-name">{despesa.nome}</div>
              <div className="expense-date">{despesa.data}</div>
            </div>
            <div className="expense-right">
              <div className="expense-value">R$ {despesa.valor}</div>
              <span className={`expense-status ${despesa.status.toLowerCase()}`}>
                {despesa.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpensesList
