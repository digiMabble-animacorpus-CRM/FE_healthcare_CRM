'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { PatientType } from '@/types/data';
import { getPatientById } from '@/helpers/patient';
import PatientDetails from './components/PatientDetails';

const PatientDetailsPage = () => {
  const { id } = useParams(); // dynamic route id
  const router = useRouter();
  const [data, setData] = useState<PatientType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      if (!id) return; // safeguard

      setLoading(true);
      try {
        console.log('ew', id);
        const patient = await getPatientById(id); // convert string to number
        if (!patient) throw new Error('Failed to fetch patient');
        setData(patient);
      } catch (error) {
        console.error(error);
        alert('Failed to load patient details');
        router.push('/patients/patient-list'); // fallback to list
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No patient found.</p>;

  return <PatientDetails data={data} />;
};

export default PatientDetailsPage;
