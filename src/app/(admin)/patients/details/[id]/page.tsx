import PageTitle from '@/components/PageTitle';
import { getAllProperty, getCustomerEnquiriesById } from '@/helpers/data';
import CustomersDetails from './components/PatientDetails';
import WeeklyInquiry from './components/WeeklyInquiry';
import TransactionHistory from './components/TransactionHistory';
import type { CustomerEnquiriesType } from '@/types/data';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customer Overview' };

interface Props {
  params: { id: string };
}

const CustomerDetailsPage = async ({ params }: Props) => {
  const patientId = params.id;
  const propertyData = await getAllProperty();
  const response = await getCustomerEnquiriesById(patientId);
  const customers: CustomerEnquiriesType[] = response.data;

  return (
    <>
      <PageTitle subName="Customers" title="Customer Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <CustomersDetails data={customers[0]} />
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
      <TransactionHistory />
    </>
  );
};

export default CustomerDetailsPage;
