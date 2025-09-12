// TherapistDetailsPage.tsx (or your page file)

'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TherapistDetails from './components/TherapistDetails';
import { getTherapistById } from '@/helpers/therapist';
import type { TherapistType } from '@/types/data';
import { branches } from '@/assets/data/branchData';
import { Availability } from '../../add-therapist/components/AddTherapist';

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
   imageUrl: rawTherapist.imageUrl || rawTherapist.photo || null,
  contactEmail: rawTherapist.contactEmail || '',
  contactPhone: rawTherapist.contactPhone || '',
  inamiNumber: rawTherapist.inamiNumber ? String(rawTherapist.inamiNumber) : '',
  aboutMe: rawTherapist.aboutMe || null,
   degreesAndTraining: rawTherapist.degreesAndTraining || rawTherapist.degreesTraining || null,
  departmentId: rawTherapist.departmentId ?? null,


specializations: Array.isArray(rawTherapist.specializations)
  ? rawTherapist.specializations.map((s: any) => ({
      id: s.specialization_id ?? null,
      name: s.specialization_type ?? '',
    }))
  : [],



  // 🔹 Branches with availability & branch name
   branches: Array.isArray(rawTherapist.branches)
  ? rawTherapist.branches.map((b: any) => {
      // accept both object or number from API
      const branchId = b.branch_id ?? b.id ?? b ?? 0;
      const branchName =
        b.name ||
        branchesList.find((br) => br.branch_id === branchId)?.name ||
        '';

      // if availability is attached per branch – filter it; else copy root availability
     const rootAvailability: Availability[] = Array.isArray(rawTherapist.availability)
  ? rawTherapist.availability.map((av: any) => ({
      branchId: av.branchId ?? av.branch_id ?? null,
      day: av.day ?? av.d ?? '',
      startTime: av.startTime ?? av.start_time ?? av.from ?? '',
      endTime: av.endTime ?? av.end_time ?? av.to ?? '',
            }))
        : [{ day: '', startTime: '', endTime: '' }];
const availabilityForThisBranch = rootAvailability.length > 0 ? rootAvailability.map(a => ({ ...a })) : [{ day: '', startTime: '', endTime: '' }];
      return {
        branch_id: branchId,
        branch_name: branchName,
        availability: availabilityForThisBranch,
      };
    })
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
