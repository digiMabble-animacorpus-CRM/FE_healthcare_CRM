"use client";

import { useState } from "react";
import type { CustomerEnquiriesType } from "@/types/data";
import CustomerInfoCard from "./components/CustomerInfoCard";
import BookAppointmentForm from "./components/BookAppointmentForm";

interface UserType {
  id: string | number;
  // Add other user properties you might need
}

export default function AppointmentPage() {
  const [customer, setCustomer] = useState<CustomerEnquiriesType | null>(null);
  
  // Safely get and parse user from localStorage
  const userString = localStorage.getItem('user');
  const user: UserType | null = userString ? JSON.parse(userString) : null;

  const handleCustomerSave = (saved: CustomerEnquiriesType) => {
    setCustomer(saved);
  };

  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log("Appointment Data:", appointmentData);
    alert("Appointment submitted successfully!");
  };

  return (
    <div className="p-3">
      <CustomerInfoCard onSave={handleCustomerSave} />

      {(customer?._id || "cc3fa39e-8e2e-4c89-8911-667c3df7eb7d") && (
        <BookAppointmentForm
          patientId={customer?._id || "cc3fa39e-8e2e-4c89-8911-667c3df7eb7d"}
          createdById={user?.id ? String(user.id) : ""}
          onSubmitHandler={handleAppointmentSubmit}
          selectedCustomer={customer || undefined}
          defaultValues={{
            notes: `Booking for ${customer?.name || "Customer"}`,
          }}
        />
      )}
    </div>
  );
}
