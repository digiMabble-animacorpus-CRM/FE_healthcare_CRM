'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect } from 'react';
import AddTherapist from '../../add-therapist/components/AddTherapist';

const TherapistEditPage = ({ params }: { params: { id: string } }) => {
  useEffect(() => {}, [params.id]);

  return (
    <>
      <PageTitle title="Edit Therapist" subName="" />
      <AddTherapist therapistId={params.id} />
    </>
  );
};

export default TherapistEditPage;
