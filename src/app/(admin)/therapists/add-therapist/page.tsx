import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTherapist from './components/AddTherapist';

export const metadata: Metadata = { title: 'Customers Add' };

const TherapistAddPage = () => {
  return (
    <>
      <PageTitle title="Ajouter un thérapeute" subName="" />
      <AddTherapist />;
    </>
  );
};

export default TherapistAddPage;
