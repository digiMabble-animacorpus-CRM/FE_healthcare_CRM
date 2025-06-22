import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AgentDetails from './components/AgentDetails'
import AgentsDetailsBanner from './components/AgentsDetailsBannner'

export const metadata: Metadata = { title: 'Agent Overview' }

const AgentsDetailsPage = () => {
  return (
    <>
      <PageTitle subName="Real Estate" title="Agent Overview" />
      <AgentsDetailsBanner />
      <AgentDetails />
    </>
  )
}

export default AgentsDetailsPage
