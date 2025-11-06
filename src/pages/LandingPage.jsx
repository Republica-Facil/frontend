import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUsers, faClipboardList, faClock, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../utils/auth'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Se já estiver autenticado, redireciona para dashboard
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="landing-container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <FontAwesomeIcon icon={faHome} />
          </div>
          <span>República Fácil</span>
        </div>
        <div className="header-buttons">
          <Link to="/login" className="btn btn-secondary">Entrar</Link>
          <Link to="/register" className="btn btn-primary">Cadastrar</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>
            Gerencie sua <span className="highlight">república</span>, de forma simples e justa
          </h1>
          <p>
            Diga adeus às planilhas e discussões sobre dinheiro. Rastreie despesas, 
            divida contas automaticamente e mantenha todos informados.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Crie Sua República Grátis
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Entrar
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="/src/assets/imagem_republica.png" 
            alt="Grupo de amigos em uma república" 
          />
        </div>
      </section>

      <section className="features">
        <div className="features-header">
          <h2>Como Funciona</h2>
          <p>Comece em minutos com nosso processo simples de 4 passos</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="feature-step">Passo 1</div>
            <h3>Crie Sua República</h3>
            <p>Configure sua república e convide todos os membros com um código simples.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>
            <div className="feature-step">Passo 2</div>
            <h3>Registre Despesas</h3>
            <p>Adicione aluguéis, contas, mercado e qualquer custos compartilhados em segundos.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="feature-step">Passo 3</div>
            <h3>Divisão Automática</h3>
            <p>O sistema divide as despesas automaticamente de forma justa entre todos os membros.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="feature-step">Passo 4</div>
            <h3>Acompanhe Pagamentos</h3>
            <p>Membros confirmam pagamentos e o painel atualiza em tempo real.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
