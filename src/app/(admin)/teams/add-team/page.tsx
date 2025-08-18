import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import AddTeam from './components/AddTeam';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const TeamAddPage = () => {
  return (
    <>
      <PageTitle title="Add Team" subName="" />
      <AddTeam params={{}} />;
    </>
  );
};

export default TeamAddPage;
