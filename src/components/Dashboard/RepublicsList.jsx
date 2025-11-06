import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPlus } from '@fortawesome/free-solid-svg-icons'

function RepublicsList({ republicas, selectedRepublic, onSelectRepublic, onCreateClick, membersCount = {} }) {
  return (
    <div className="republics-section">
      <div className="section-header">
        <h2>Minhas Repúblicas</h2>
        <button className="btn-add" onClick={onCreateClick}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
          Criar Nova República
        </button>
      </div>

      {republicas.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faHome} style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>Nenhuma república encontrada</h3>
          <p>Comece criando sua primeira república clicando no botão acima.</p>
        </div>
      ) : (
        <div className="republics-grid">
          {republicas.map(republic => {
            const memberCount = membersCount[republic.id] || 0
            return (
              <div 
                key={republic.id} 
                className={`republic-card ${selectedRepublic === republic.id ? 'selected' : ''}`}
                onClick={() => onSelectRepublic(republic.id)}
              >
                <div className="republic-icon">
                  <FontAwesomeIcon icon={faHome} />
                </div>
                <div className="republic-info">
                  <h3>{republic.nome}</h3>
                  <p>{memberCount} {memberCount === 1 ? 'membro' : 'membros'}</p>
                </div>
                <div className="republic-actions">
                  <button className="btn-view">Ver Dashboard</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RepublicsList
