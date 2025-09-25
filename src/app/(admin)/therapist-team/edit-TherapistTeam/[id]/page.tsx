import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTeamPage from '../../add-Therapteam/components/AddTeam';

export const metadata: Metadata = { title: 'Edit Team Member' };

const EditTeam = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Team" subName="" />
      <AddTeamPage teamMemberId={params.id} isEdit />
    </>
  );
};

export default EditTeam;
