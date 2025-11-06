import SummaryCards from './SummaryCards'
import ExpensesList from './ExpensesList'
import RepublicsList from './RepublicsList'
import MembersSection from './MembersSection'
import ProfileSection from './ProfileSection'

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

  if (activeMenu === 'membros') {
    return <MembersSection selectedRepublic={selectedRepublic} onMembersChange={onMembersChange} />
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
