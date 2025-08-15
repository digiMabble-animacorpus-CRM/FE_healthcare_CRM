"use client";

import BookAppointmentForm from "./components/BookAppointmentForm";
import CustomerInfoCard from "./components/CustomerInfoCard";

export default function AppointmentPage() {
  const handleCustomerSave = (updatedInfo: any) => {
    console.log("Updated Customer Info:", updatedInfo);
  };

  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log("Appointment Data:", appointmentData);
  };

  return (
    <div>
      <CustomerInfoCard onSave={handleCustomerSave} />
      <BookAppointmentForm onSubmitHandler={handleAppointmentSubmit} />
    </div>
  );
}
