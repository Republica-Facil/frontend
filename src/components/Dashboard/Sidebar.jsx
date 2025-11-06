import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faSignOutAlt, 
  faChartLine, 
  faReceipt, 
  faCreditCard,
  faDoorOpen,
  faUser,
  faBuilding
} from '@fortawesome/free-solid-svg-icons'

function Sidebar({ currentRepublic, activeMenu, setActiveMenu, onLogout, loading }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <FontAwesomeIcon icon={faHome} />
          </div>
          <span className="logo-text">República Fácil</span>
        </div>
        <p className="republic-name">{currentRepublic.nome}</p>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeMenu === 'republicas' ? 'active' : ''}`}
          onClick={() => setActiveMenu('republicas')}
        >
          <FontAwesomeIcon icon={faBuilding} />
          <span>Repúblicas</span>
        </button>

        <div className="nav-divider"></div>
        
        <button 
          className={`nav-item ${activeMenu === 'resumo' ? 'active' : ''}`}
          onClick={() => setActiveMenu('resumo')}
        >
          <FontAwesomeIcon icon={faChartLine} />
          <span>Resumo</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'despesas' ? 'active' : ''}`}
          onClick={() => setActiveMenu('despesas')}
        >
          <FontAwesomeIcon icon={faReceipt} />
          <span>Despesas</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'pagamentos' ? 'active' : ''}`}
          onClick={() => setActiveMenu('pagamentos')}
        >
          <FontAwesomeIcon icon={faCreditCard} />
          <span>Pagamentos</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'quartos' ? 'active' : ''}`}
          onClick={() => setActiveMenu('quartos')}
        >
          <FontAwesomeIcon icon={faDoorOpen} />
          <span>Quartos</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'membros' ? 'active' : ''}`}
          onClick={() => setActiveMenu('membros')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Membros</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveMenu('perfil')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Perfil</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="nav-item logout-btn" disabled={loading}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>{loading ? 'Saindo...' : 'Sair'}</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
