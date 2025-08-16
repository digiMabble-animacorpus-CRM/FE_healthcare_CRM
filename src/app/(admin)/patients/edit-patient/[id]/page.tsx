import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import AddCustomer from '../../add-patient/components/AddPatient';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const PatientEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Enquiry" subName="" />
      <AddCustomer params={params} />
    </>
  );
};

export default PatientEditPage;
