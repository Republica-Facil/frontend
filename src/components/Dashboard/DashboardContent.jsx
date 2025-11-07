import SummaryCards from './SummaryCards'
import ExpensesList from './ExpensesList'
import RepublicsList from './RepublicsList'
import MembersSection from './MembersSection'
import ProfileSection from './ProfileSection'
import RoomsSection from './RoomsSection'
import ExpensesSection from './ExpensesSection'
import PaymentsSection from './PaymentsSection'
import ReportsSection from './ReportsSection'

function DashboardContent({ 
  activeMenu, 
  resumoData, 
  despesasRecentes, 
  republicas, 
  selectedRepublic, 
  onSelectRepublic, 
  onCreateRepublicClick,
  membersCount = {},
  onMembersChange
}) {
  if (activeMenu === 'republicas') {
    return (
      <RepublicsList 
        republicas={republicas}
        selectedRepublic={selectedRepublic}
        onSelectRepublic={onSelectRepublic}
        onCreateClick={onCreateRepublicClick}
        membersCount={membersCount}
      />
    )
  }

  if (activeMenu === 'resumo') {
    return <ReportsSection selectedRepublic={selectedRepublic} />
  }

  if (activeMenu === 'membros') {
    return <MembersSection selectedRepublic={selectedRepublic} onMembersChange={onMembersChange} />
  }

  if (activeMenu === 'quartos') {
    return <RoomsSection selectedRepublic={selectedRepublic} />
  }

  if (activeMenu === 'despesas') {
    return <ExpensesSection selectedRepublic={selectedRepublic} />
  }

  if (activeMenu === 'pagamentos') {
    return <PaymentsSection selectedRepublic={selectedRepublic} />
  }

  if (activeMenu === 'perfil') {
    return <ProfileSection />
  }

  // Conteúdo padrão (Resumo)
  return (
    <>
      <SummaryCards resumoData={resumoData} />
      <ExpensesList despesasRecentes={despesasRecentes} />
    </>
  )
}

export default DashboardContent
