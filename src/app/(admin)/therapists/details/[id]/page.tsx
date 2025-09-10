// TherapistDetailsPage.tsx (or your page file)

'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TherapistDetails from './components/TherapistDetails';
import { getTherapistById } from '@/helpers/therapist';
import type { TherapistType } from '@/types/data';
import { branches } from '@/assets/data/branchData';

const TherapistDetailsPage = () => {
  const params = useParams();
  const therapistId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [data, setData] = useState<TherapistType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTherapist = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!therapistId) return;

      const rawTherapist = await getTherapistById(therapistId);
      if (!rawTherapist) {
        setData(null);
        return;
      }

      const transformedData: TherapistType = {
  therapistId: rawTherapist.therapistId ?? null,
  firstName: rawTherapist.firstName || '',
  lastName: rawTherapist.lastName || '',
  fullName: `${rawTherapist.firstName || ''} ${rawTherapist.lastName || ''}`.trim(),
  photo: rawTherapist.photo || null,
  contactEmail: rawTherapist.contactEmail || '',
  contactPhone: rawTherapist.contactPhone || '',
  inamiNumber: rawTherapist.inamiNumber ? String(rawTherapist.inamiNumber) : '',
  aboutMe: rawTherapist.aboutMe || null,
  consultations: rawTherapist.consultations || null,
  degreesAndTraining: rawTherapist.degreesAndTraining || null,
  departmentId: rawTherapist.departmentId ?? null,
  specializationIds: rawTherapist.specializationIds || [],

  // 🔹 Branches with availability & branch name
  branches:
    Array.isArray(rawTherapist.branches) && Array.isArray(rawTherapist.availability)
      ? rawTherapist.branches.map((branchId: number) => ({
          branch_id: branchId,
          branch_name:
            branches.find((b) => b.branch_id === branchId)?.name || '',
          availability:
            rawTherapist.availability.filter(
              (av: any) =>
                av.branchId === branchId || av.branch_id === branchId
            ) || [],
        }))
      : [],

  languages: Array.isArray(rawTherapist.languages)
    ? rawTherapist.languages
    : [],
  faq: rawTherapist.faq || null,
  paymentMethods: Array.isArray(rawTherapist.paymentMethods)
    ? rawTherapist.paymentMethods
    : [],
};

      setData(transformedData);
    } catch (error) {
      console.error(error, 'Error loading therapist details');
      alert('Failed to load therapist details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!therapistId) return;
    fetchTherapist();
  }, [therapistId]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No therapist found.</p>;

  return (
    <>
      <PageTitle subName="Healthcare" title="Therapist Overview" />
      <TherapistDetails data={data} />
    </>
  );
};

export default TherapistDetailsPage;
