import PageTitle from '@/components/PageTitle'
import CustomerByCountry from './components/CustomerByCountry'
import CustomerCountry from './components/CustomerCountry'
import CustomersInvest from './components/CustomersInvest'
import PropertyInvestor from './components/PropertyInvestor'
import TopCustomer from './components/TopCustomer'
import CustomerVisit from './components/CustomerVisit'
import PurchaseProperty from './components/PurchaseProperty'
import { Col, Row } from 'react-bootstrap'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Customers' }

const CustomerPage = () => {
  return (
    <>
      <PageTitle title="Customers" subName="Dashboards" />
      <Row>
        <Col xl={8} lg={12}>
          <CustomerCountry />
          <Row>
            <Col lg={6}></Col>
          </Row>
        </Col>
        <PropertyInvestor />
      </Row>
      <Row>
        <CustomersInvest />
        <CustomerByCountry />
      </Row>
      <Row>
        <TopCustomer />
        <CustomerVisit />
        <PurchaseProperty />
      </Row>
    </>
  )
}

export default CustomerPage
