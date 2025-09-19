// /appointments/new/page.tsx
'use client';

import type { PatientType } from '../types/appointment';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const CustomerInfoCard = dynamic(() => import('../components/CustomerInfoCard'), { ssr: false });
const BookAppointmentForm = dynamic(() => import('../components/BookAppointmentForm'), {
  ssr: false,
});

interface UserType {
  team_id: string | number;
}

export default function NewAppointmentPage() {
  const [customer, setCustomer] = useState<PatientType | null>(null);
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

  const handleCustomerSave = (saved: PatientType) => {
    console.log(saved,"saved")
    setCustomer(saved);
  };

  const handleReset = () => {
    setCustomer(null);
    setResetTrigger((prev) => prev + 1);
  };

  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log('Appointment Data:', appointmentData);
  };

  if (!isClient) return null;

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Create New Appointment</h1>
      
      <CustomerInfoCard
        onSave={handleCustomerSave}
        onReset={handleReset}
        key={resetTrigger}
      />

      {customer?.id && (
        <BookAppointmentForm
          patientId={customer.id}
          createdById={user?.team_id ? String(user.team_id) : ''}
          onSubmitHandler={handleAppointmentSubmit}
          selectedCustomer={customer}
          mode="create"
        />
      )}
    </div>
  );
}