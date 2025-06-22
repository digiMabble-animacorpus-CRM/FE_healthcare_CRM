import PageTitle from '@/components/PageTitle'
import React from 'react'
import EmailView from './components/EmailView'
import { Card, Row } from 'react-bootstrap'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inbox' }

const InboxPage = () => {
  return (
    <>
      <PageTitle title="Inbox" subName="Real Estate" />
      <Card>
        <Row className="g-0">
          <EmailView />
        </Row>
      </Card>
    </>
  )
}

export default InboxPage
