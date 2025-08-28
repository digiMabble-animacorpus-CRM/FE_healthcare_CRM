import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import AddTeam from './components/AddTeam';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const TeamAddPage = () => {
  return (
    <>
      <PageTitle title="Add Team" subName="" />
      <AddTeam isEdit={false} />
    </>
  );
};

export default TeamAddPage;
