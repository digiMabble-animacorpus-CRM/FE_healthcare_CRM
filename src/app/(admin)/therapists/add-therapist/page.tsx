import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddTherapist from './components/AddTherapist';

export const metadata: Metadata = { title: 'Customers Add' };

const TherapistAddPage = () => {
  return (
    <>
      <PageTitle title="Add Therapist" subName="" />
      <AddTherapist />;
    </>
  );
};

export default TherapistAddPage;
