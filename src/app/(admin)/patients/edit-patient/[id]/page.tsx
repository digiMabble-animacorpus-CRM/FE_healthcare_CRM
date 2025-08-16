import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import AddPatient from '../../add-patient/components/AddPaitent';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const PatientEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Enquiry" subName="" />
      <AddPatient params={params} />
    </>
  );
};

export default PatientEditPage;
