import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTeamPage from './components/AddTeam';

export const metadata: Metadata = { title: 'Add Team Members' };

const TeamAddPage = () => {
  return (
    <>
      <PageTitle title="Add Team" subName="" />
      <AddTeamPage isEdit={false} />
    </>
  );
};

export default TeamAddPage;
