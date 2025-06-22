import { Col, Row } from 'react-bootstrap'
import UIExamplesList from '@/components/UIExamplesList'
import AllRadarCharts from './components/AllRadarCharts'
import type { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = { title: 'Radar Chart' }

const RadarCharts = () => {
  return (
    <>
      <PageTitle title="Radar" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllRadarCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { label: 'Basic Radar Chart', link: '#basic' },
              { label: 'Radar with Polygon-fill', link: '#polygon' },
              { label: 'Radar – Multiple Series', link: '#multiple-series' },
            ]}
          />
        </Col>
      </Row>
    </>
  )
}

export default RadarCharts
