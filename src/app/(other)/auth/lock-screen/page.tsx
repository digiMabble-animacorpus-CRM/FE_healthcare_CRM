import { Metadata } from 'next'
import LockScreen from './components/LockScreen'

export const metadata: Metadata = { title: 'Lock Screen' }

const LockScreenPage = () => {
  return <LockScreen />
}

export default LockScreenPage
