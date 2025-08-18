import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';
import AddTeam from '../../add-team/components/AddTeam';

export const metadata: Metadata = { title: 'Customers Add' };

const TeamEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Customer" subName="" />
      <AddTeam params={params} />
    </>
  );
};

export default TeamEditPage;
