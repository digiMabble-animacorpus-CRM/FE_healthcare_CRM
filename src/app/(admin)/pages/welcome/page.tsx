import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Welcome' }

const WelcomePage = () => {
  return (
    <>
      <PageTitle title="Welcome" subName="Pages" />
    </>
  )
}

export default WelcomePage
