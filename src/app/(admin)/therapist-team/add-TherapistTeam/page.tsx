import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTherapistTeamPage from './components/AddTherapistTeam';

export const metadata: Metadata = { title: 'Ajouter des membres de léquipe' };

const TherapistTeamAddPage = () => {
  return (
    <>
      <PageTitle title="Ajouter une thérapeutes équipe" subName="" />
      <AddTherapistTeamPage isEdit={false} />
    </>
  );
};

export default TherapistTeamAddPage;
