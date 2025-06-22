import { Metadata } from 'next'
import Maintenance from './components/Maintenance'

export const metadata: Metadata = { title: 'Maintenance' }

const MaintenancePage = () => {
  return <Maintenance />
}

export default MaintenancePage
