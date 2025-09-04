'use client';

import { useState, useEffect } from "react";
import type { CustomerEnquiriesType, PatientType } from "@/types/data";
import dynamic from "next/dynamic";

// Dynamically import client-only components
const CustomerInfoCard = dynamic(() => import("./components/CustomerInfoCard"), { ssr: false });
const BookAppointmentForm = dynamic(() => import("./components/BookAppointmentForm"), { ssr: false });

interface UserType {
  team_id: string | number;
}

export default function AppointmentPage() {
  const [customer, setCustomer] = useState<PatientType | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    setIsClient(true);

    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  const handleCustomerSave = (saved: PatientType) => {
    setCustomer(saved);
  };

  const handleReset = () => {
    setCustomer(null);
    setResetTrigger(prev => prev + 1); // Force re-render of CustomerInfoCard
  };

  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log("Appointment Data:", appointmentData);
  };

  if (!isClient) return null;

  return (
    <div className="p-3">
      <CustomerInfoCard 
        onSave={handleCustomerSave} 
        onReset={handleReset}
        key={resetTrigger} // Force re-render when reset is triggered
      />

      {customer?.id && (
        <BookAppointmentForm
          patientId={customer.id}
          createdById={user?.team_id ? String(user.team_id) : ""}
          onSubmitHandler={handleAppointmentSubmit}
          selectedCustomer={customer}
        />
      )}
    </div>
  );
}