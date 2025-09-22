import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddPatient from './components/AddPatient';

export const metadata: Metadata = { title: 'Patient Add' };

const CustomerAddPage = () => {
  return (
    <>
      <PageTitle title="Ajouter un patient" subName="Patient" />
      <AddPatient params={{}} />
    </>
  );
};

export default CustomerAddPage;
