// /appointments/edit/[id]/page.tsx
'use client';

import { API_BASE_PATH } from '@/context/constants';
import type { PatientType, AppointmentType } from '../../types/appointment';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PatientInfoCard = dynamic(() => import('../../components/PatientInfoCard'), { ssr: false });
const BookAppointmentForm = dynamic(() => import('../../components/BookAppointmentForm'), {
  ssr: false,
});

interface UserType {
  team_id: string | number;
}

export default function EditAppointmentPage() {
  const [patient, setPatient] = useState<PatientType | null>(null);
  const [appointment, setAppointment] = useState<AppointmentType | null>(null);
  console.log(appointment,"appointment")
  const [user, setUser] = useState<UserType | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

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

    if (params?.id) {
      fetchAppointmentData(params.id as string);
    }
  }, [params?.id]);

  const fetchAppointmentData = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_PATH}/appointments/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response, "refshdjfdj")
      
      if (response.ok) {
        const data = await response.json();
        setAppointment(data.data);
        
        if (data.data.patient) {
          setPatient(data.data.patient);
        }
      } else {
        console.error('Failed to fetch appointment data');
        router.push('/appointments/new');
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      router.push('/appointments/new');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log('Appointment Data:', appointmentData);
  };

  if (!isClient || loading) {
    return (
      <div className="p-3 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-3">
        <div className="alert alert-danger">Appointment not found</div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Edit Appointment</h1>
      
      <PatientInfoCard
        onSave={setPatient}
        initialData={appointment.patient}
        mode="view"
      />

      {patient?.id && (
        <BookAppointmentForm
          patientId={patient.id}
          modifiedById={user?.team_id ? String(user.team_id) : ''}
          createdById={user?.team_id ? String(user.team_id) : ''}
          onSubmitHandler={handleAppointmentSubmit}
          selectedPatient={patient}
          mode="edit"
          appointmentData={appointment}
          appointmentId={appointment.id}
        />
      )}
    </div>
  );
}