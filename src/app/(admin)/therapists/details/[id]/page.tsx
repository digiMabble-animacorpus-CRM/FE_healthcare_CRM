import PageTitle from '@/components/PageTitle';
import { getAllProperty, getTherapistById } from '@/helpers/data';
import TherapistDetails from './components/TherapistDetails';
import WeeklyInquiry from './components/WeeklyInquiry';
import TransactionHistory from './components/TransactionHistory';
import type { TherapistType } from '@/types/data';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customer Overview' };

interface Props {
  params: { id: string };
}

const TherapistDetailsPage = async ({ params }: Props) => {
  const patientId = params.id;
  const propertyData = await getAllProperty();
  const response = await getTherapistById(patientId);
  const therapists: TherapistType[] = response.data;

  return (
    <>
      <PageTitle subName="Customers" title="Customer Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <TherapistDetails data={therapists[0]} />
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
      <TransactionHistory />
    </>
  );
};

export default TherapistDetailsPage;
