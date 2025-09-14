"use client"

import PageTitle from '@/components/PageTitle';
import { useEffect } from 'react';
import AddTherapist from '../../add-therapist/components/AddTherapist';

const TherapistEditPage = ({ params }: { params: { id: string } }) => {
  useEffect(() => {
    console.log('TherapistEditPage id param:', params.id);
  }, [params.id]);

  return (
    <>
      <PageTitle title="Edit Therapist" subName="" />
      <AddTherapist therapistId={params.id} />
    </>
  );
};

export default TherapistEditPage;
