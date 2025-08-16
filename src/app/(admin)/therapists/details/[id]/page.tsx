'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { TherapistType } from '@/types/data';
import { getTherapistById } from '@/helpers/therapist';
import TherapistDetails from './components/TherapistDetails';

const TherapistDetailsPage = () => {
  const { id } = useParams(); // dynamic route id
  const router = useRouter();
  const [data, setData] = useState<TherapistType | null>(null);
  const [loading, setLoading] = useState(true);

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
        router.push('/therapists'); // fallback to list
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No therapist found.</p>;

  return <TherapistDetails data={data} />;
};

export default TherapistDetailsPage;
