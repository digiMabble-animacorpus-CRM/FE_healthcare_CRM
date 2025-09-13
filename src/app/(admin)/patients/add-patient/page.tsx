import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';
import AddPatient from './components/AddPatient';

export const metadata: Metadata = { title: 'Customers Add' };

const CustomerAddPage = () => {
  return (
    <>
      <PageTitle title="Add Patient" subName="" />
      <AddPatient params={{}} />
    </>
  );
};

export default CustomerAddPage;
