'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TherapistDetails from './components/TherapistDetails';
import { getTherapistById } from '@/helpers/therapist';
import type { TherapistType } from '@/types/data';

const TherapistDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<TherapistType | null>(null);
  const [loading, setLoading] = useState(true);

  // 👉 Default mock data
  const defaultWeeklySessions = [
    { week: 'Week 1', sessions: 5 },
    { week: 'Week 2', sessions: 3 },
    { week: 'Week 3', sessions: 8 },
  ];

  const defaultStats = [
    { title: 'Total Appointments', count: 12, progress: 75, icon: 'ri:calendar-line', variant: 'primary' },
    { title: 'Completed Visits', count: 9, progress: 60, icon: 'ri:check-line', variant: 'success' },
    { title: 'Pending Visits', count: 3, progress: 25, icon: 'ri:time-line', variant: 'warning' },
  ];

  const defaultTransactions = [
    { date: '2025-08-01', type: 'Consultation', amount: 120, status: 'Completed' },
    { date: '2025-08-03', type: 'Follow-up', amount: 80, status: 'Pending' },
    { date: '2025-08-05', type: 'Therapy Session', amount: 150, status: 'Completed' },
  ];

  const defaultFeedbacks = [
    { name: 'John Doe', userName: 'jdoe', country: 'USA', day: 2, description: 'Very satisfied with the service.', rating: 5 },
    { name: 'Jane Smith', userName: 'jsmith', country: 'UK', day: 5, description: 'Helpful and attentive.', rating: 4 },
  ];

  const defaultFiles = [
    { name: 'Report.pdf', size: 2, icon: 'ri:file-pdf-line', variant: 'danger' },
    { name: 'Prescription.docx', size: 1.2, icon: 'ri:file-word-line', variant: 'primary' },
  ];

  useEffect(() => {
    if (!id) return;

    const fetchTherapist = async () => {
      setLoading(true);
      try {
        const therapist = await getTherapistById(id);
        if (!therapist) throw new Error('Failed to fetch therapist');
        setData(therapist);
      } catch (error) {
        console.error(error);
        alert('Failed to load therapist details');
        router.push('/therapists');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id, router]);

  // Safe splitting helpers
  const safeSplit = (value?: string | string[], separator = ',') => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(separator).map((v) => v.trim());
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No therapist found.</p>;

  return (
    <>
      <PageTitle subName="Healthcare" title="Therapist Overview" />
      <TherapistDetails
        name={data.fullName || ''}
        jobTitle={data.jobTitle || ''}
        email={data.contactEmail || ''}
        phone={data.contactPhone || ''}
        about={data.aboutMe || ''}
        languages={safeSplit(data.spokenLanguages, ',')}
        website={data.website || ''}
        education={safeSplit(data.degreesAndTraining, '\n')}
        specializations={safeSplit(data.specializations, '\n')}
        weeklySessions={defaultWeeklySessions}
        stats={defaultStats}
        transactions={defaultTransactions} // mock transactions if needed
        feedbacks={defaultFeedbacks}
        files={defaultFiles}
        photo={data.photo || undefined}
        agendaLink={data.agendaLinks || undefined}
      />
    </>

  );
};

export default TherapistDetailsPage;
