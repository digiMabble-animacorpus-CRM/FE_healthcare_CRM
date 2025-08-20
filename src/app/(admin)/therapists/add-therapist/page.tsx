import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import AddTherapist from './components/AddTherapist';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const TherapistAddPage = () => {
  return (
    <>
      <PageTitle title="Add Therapist" subName="" />
      <AddTherapist params={{}} />;
    </>
  );
};

export default TherapistAddPage;
