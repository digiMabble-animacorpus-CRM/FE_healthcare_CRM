import { Col, Row } from 'react-bootstrap'
import UIExamplesList from '@/components/UIExamplesList'
import AllMixedCharts from './components/AllMixedCharts'
import type { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = { title: 'Mixed Charts' }

const MixedCharts = () => {
  return (
    <>
      <PageTitle title="Mixed" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllMixedCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: '#line-column', label: 'Line & Column Chart' },
              { link: '#multiple-yaxis', label: 'Multiple Y-Axis Chart' },
              { link: '#line-area', label: 'Line & Area Chart' },
              { link: '#all', label: 'Line, Column & Area Chart' },
            ]}
          />
        </Col>
      </Row>
    </>
  )
}

export default MixedCharts
