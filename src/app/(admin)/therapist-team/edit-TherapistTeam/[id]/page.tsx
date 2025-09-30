import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTherapistTeamPage from '../../add-TherapistTeam/components/AddTherapistTeam';

export const metadata: Metadata = { title: 'Edit Team Member' };

const EditTeam = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Therapist Team" subName="" />
      <AddTherapistTeamPage editId={params.id} />
    </>
  );
};

export default EditTeam;
