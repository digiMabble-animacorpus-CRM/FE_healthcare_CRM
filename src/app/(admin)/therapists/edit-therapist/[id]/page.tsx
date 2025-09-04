import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';
import AddTherapist from '../../add-therapist/components/AddTherapist';

export const metadata: Metadata = { title: 'Therpaist Add' };

const TherapistEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Therpaist" subName="" />
      <AddTherapist params={params} />
    </>
  );
};

export default TherapistEditPage;
