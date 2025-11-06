import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { performLogout } from '../utils/auth'
import { useRepublicas } from '../hooks/useRepublicas'
import api from '../services/api'
import { 
  Sidebar, 
  CreateRepublicModal, 
  DashboardContent 
} from '../components/Dashboard'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState('republicas')
  const [selectedRepublic, setSelectedRepublic] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [membersCount, setMembersCount] = useState({})

  // Hook para gerenciar repúblicas
  const { 
    republicas, 
    loading: loadingRepublicas, 
    error: republicasError,
    addRepublica,
    fetchRepublicas
  } = useRepublicas()

  // Buscar número de membros de cada república
  const fetchMembersCount = async () => {
    const counts = {}
    for (const republica of republicas) {
      try {
        const response = await api.get(`/membros/${republica.id}`)
        counts[republica.id] = response.data.members?.length || 0
      } catch (err) {
        console.error(`Erro ao buscar membros da república ${republica.id}:`, err)
        counts[republica.id] = 0
      }
    }
    setMembersCount(counts)
  }

  // Atualizar contagem de membros quando repúblicas mudarem
  useEffect(() => {
    if (republicas.length > 0) {
      fetchMembersCount()
    }
  }, [republicas])

  // Selecionar primeira república quando carregar
  useEffect(() => {
    if (republicas.length > 0 && !selectedRepublic) {
      setSelectedRepublic(republicas[0].id)
    }
  }, [republicas, selectedRepublic])

  const currentRepublic = republicas.find(r => r.id === selectedRepublic) || republicas[0] || { nome: 'Carregando...', membros: 0 }
  const currentMembersCount = membersCount[selectedRepublic] || 0

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      // Faz logout completo (backend + frontend)
      await performLogout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      // Redireciona para login
      navigate('/login')
    }
  }

  const handleRepublicCreated = (novaRepublica) => {
    addRepublica(novaRepublica)
    setSelectedRepublic(novaRepublica.id)
    setActiveMenu('resumo')
  }

  const handleSelectRepublic = (republicId) => {
    setSelectedRepublic(republicId)
    setActiveMenu('resumo')
  }

  // Atualizar contagem de membros de uma república específica
  const updateMembersCount = async (republicaId) => {
    try {
      const response = await api.get(`/membros/${republicaId}`)
      setMembersCount(prev => ({
        ...prev,
        [republicaId]: response.data.members?.length || 0
      }))
    } catch (err) {
      console.error(`Erro ao atualizar contagem de membros:`, err)
    }
  }

  // Dados mockados
  const resumoData = {
    totalDespesas: 2450,
    seuSaldo: -125,
    membrosAtivos: currentMembersCount
  }

  const despesasRecentes = [
    { id: 1, nome: 'Aluguel - Maio', data: '1 Mai', valor: 1600, status: 'Pago' },
    { id: 2, nome: 'Conta de Luz', data: '3 Mai', valor: 180, status: 'Pendente' },
    { id: 3, nome: 'Internet', data: '5 Mai', valor: 65, status: 'Pago' },
    { id: 4, nome: 'Mercado', data: '8 Mai', valor: 245, status: 'Pendente' }
  ]

  return (
    <div className="dashboard-container">
      {/* Mensagem de erro */}
      {republicasError && (
        <div className="error-banner">
          {republicasError}
        </div>
      )}

      {/* Modal de Criar República */}
      <CreateRepublicModal 
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onRepublicCreated={handleRepublicCreated}
        republicas={republicas}
      />

      {/* Sidebar */}
      <Sidebar 
        currentRepublic={currentRepublic}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
        loading={loading}
      />

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1>
            {activeMenu === 'republicas' && 'Repúblicas'}
            {activeMenu === 'resumo' && 'Resumo'}
            {activeMenu === 'despesas' && 'Despesas'}
            {activeMenu === 'pagamentos' && 'Pagamentos'}
            {activeMenu === 'quartos' && 'Quartos'}
            {activeMenu === 'membros' && 'Membros'}
            {activeMenu === 'perfil' && 'Perfil'}
          </h1>
          <p className="subtitle">
            {activeMenu === 'republicas' && 'Gerencie todas as suas repúblicas'}
            {activeMenu === 'resumo' && 'Gerencie as despesas e pagamentos da sua república'}
            {activeMenu === 'despesas' && 'Controle todas as despesas da república'}
            {activeMenu === 'pagamentos' && 'Acompanhe os pagamentos dos membros'}
            {activeMenu === 'quartos' && 'Gerencie os quartos da república'}
            {activeMenu === 'membros' && 'Gerencie os membros da república'}
            {activeMenu === 'perfil' && 'Atualize suas informações pessoais'}
          </p>
        </header>

        {loadingRepublicas && republicas.length === 0 ? (
          <div className="loading-state">
            <p>Carregando repúblicas...</p>
          </div>
        ) : (
          <DashboardContent 
            activeMenu={activeMenu}
            resumoData={resumoData}
            despesasRecentes={despesasRecentes}
            republicas={republicas}
            selectedRepublic={selectedRepublic}
            onSelectRepublic={handleSelectRepublic}
            onCreateRepublicClick={() => setShowModal(true)}
            membersCount={membersCount}
            onMembersChange={updateMembersCount}
          />
        )}
      </main>
    </div>
  )
}

export default Dashboard
