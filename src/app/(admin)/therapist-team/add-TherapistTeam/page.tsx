import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTeamPage from './components/AddTherapistTeam';

export const metadata: Metadata = { title: 'Ajouter des membres de léquipe' };

const TeamAddPage = () => {
  return (
    <>
      <PageTitle title="Ajouter une équipe" subName="" />
      <AddTeamPage isEdit={false} />
    </>
  );
};

export default TeamAddPage;
