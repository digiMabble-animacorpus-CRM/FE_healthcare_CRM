'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TherapistDetails from './components/TherapistDetails';
import { getTherapistById } from '@/helpers/therapist';
import type { TherapistType } from '@/types/data';

const TherapistDetailsPage = () => {
  const params = useParams();
  const therapistId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [data, setData] = useState<TherapistType | null>(null);
  const [loading, setLoading] = useState(true);

  // 👉 Default mock data
  const defaultWeeklySessions = [
    { week: 'Week 1', sessions: 5 },
    { week: 'Week 2', sessions: 3 },
    { week: 'Week 3', sessions: 8 },
  ];

  const defaultStats = [
    {
      title: 'Total Appointments',
      count: 12,
      progress: 75,
      icon: 'ri:calendar-line',
      variant: 'primary',
    },
    {
      title: 'Completed Visits',
      count: 9,
      progress: 60,
      icon: 'ri:check-line',
      variant: 'success',
    },
    {
      title: 'Pending Visits',
      count: 3,
      progress: 25,
      icon: 'ri:time-line',
      variant: 'warning',
    },
  ];

  const defaultTransactions = [
    { date: '2025-08-01', type: 'Consultation', amount: 120, status: 'Completed' },
    { date: '2025-08-03', type: 'Follow-up', amount: 80, status: 'Pending' },
    { date: '2025-08-05', type: 'Therapy Session', amount: 150, status: 'Completed' },
  ];

  const defaultFeedbacks = [
    {
      name: 'John Doe',
      userName: 'jdoe',
      country: 'USA',
      day: 2,
      description: 'Very satisfied with the service.',
      rating: 5,
    },
    {
      name: 'Jane Smith',
      userName: 'jsmith',
      country: 'UK',
      day: 5,
      description: 'Helpful and attentive.',
      rating: 4,
    },
  ];

  const defaultFiles = [
    { name: 'Report.pdf', size: 2, icon: 'ri:file-pdf-line', variant: 'danger' },
    { name: 'Prescription.docx', size: 1.2, icon: 'ri:file-word-line', variant: 'primary' },
  ];

  // ✅ Typed fetcher
  const fetchTherapist = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!therapistId) return;
      const therapist = await getTherapistById(therapistId);
      console.log("Full therapist object:", therapist);
      setData(therapist);
    } catch (error) {
      console.error(error, "Error");
      alert('Failed to load therapist details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!therapistId) return;
    fetchTherapist();
  }, [therapistId]); // ✅ no router dependency

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No therapist found.</p>;

  return (
    <>
      <PageTitle subName="Healthcare" title="Therapist Overview" />
      <TherapistDetails
        id={data.idPro.toString()}
        photo={data.imageUrl}
        name={`${data.firstName} ${data.lastName}`}
        jobTitle={data.jobTitle}
        email={data.contactEmail}
        phone={data.contactPhone}
        cabinets={[
          {
            address: '15 Place de l’Orneau, Gembloux',
            email: 'contact@animacorpus.be',
            phone: '+32492401877',
            hours: {
              Monday: '08:00-20:30',
              Tuesday: '08:00-20:30',
              Wednesday: '08:00-20:30',
              Thursday: '08:00-20:30',
              Friday: '08:00-20:30',
              Saturday: '08:00-20:30',
              Sunday: 'Closed',
            },
            isPrimary: true,
          },
          {
            address: '273 Grand route, Lillois',
            hours: {
              Monday: '09:00-18:00',
              Tuesday: '09:00-18:00',
              Wednesday: '09:00-18:00',
              Thursday: '09:00-18:00',
              Friday: '09:00-18:00',
              Saturday: 'Closed',
              Sunday: 'Closed',
            },
          },
          {
            address: '62 Rue Gustave Fiévet, Sombreffe',
            hours: {
              Monday: '10:00-16:00',
              Tuesday: '10:00-16:00',
              Wednesday: '10:00-16:00',
              Thursday: '10:00-16:00',
              Friday: '10:00-16:00',
              Saturday: 'Closed',
              Sunday: 'Closed',
            },
          },
        ]}
        about={data.aboutMe}
        languages={data.spokenLanguages?.split(',') || []}
        website={data.website}
        education={data.degreesAndTraining?.split('\n') || []}
        specializations={data.specializations?.split('\n') || []}
        weeklySessions={defaultWeeklySessions}
        stats={defaultStats}
        transactions={defaultTransactions}
        feedbacks={defaultFeedbacks}
        files={defaultFiles}
        agendaLink={data.agendaLinks || undefined}
      />
    </>
  );
};

export default TherapistDetailsPage;
