import AddPatient from '@/app/(admin)/patients/add-patient/components/AddPatient';
import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const PatientEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Patient" subName="" />
      <AddPatient params={params} />
    </>
  );
};

export default PatientEditPage;
