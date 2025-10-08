// /appointments/new/page.tsx
'use client';

import type { PatientType } from '../types/appointment';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const PatientInfoCard = dynamic(() => import('../components/PatientInfoCard'), { ssr: false });
const BookAppointmentForm = dynamic(() => import('../components/BookAppointmentForm'), {
  ssr: false,
});

interface UserType {
  team_id: string | number;
}

export default function NewAppointmentPage() {
  const [patient, setPatient] = useState<PatientType | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    setIsClient(true);

    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
      }
    }
  }, []);

  const handlePatientSave = (saved: PatientType) => {
    setPatient(saved);
  };

  const handleReset = () => {
    setPatient(null);
    setResetTrigger((prev) => prev + 1);
  };

  const handleAppointmentSubmit = (appointmentData: any) => {};

  if (!isClient) return null;

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Create New Appointment</h1>

      <PatientInfoCard onSave={handlePatientSave} onReset={handleReset} key={resetTrigger} />

      {patient?.id && (
        <BookAppointmentForm
          patientId={patient.id}
          createdById={user?.team_id ? String(user.team_id) : ''}
          onSubmitHandler={handleAppointmentSubmit}
          selectedPatient={patient}
          mode="create"
        />
      )}
    </div>
  );
}
