"use client";

import { useState } from "react";
import { CustomerEnquiriesType } from "@/types/data";
import CheckCustomerModal from "./components/CheckCustomerModal";
import BookAppointmentForm from "./components/BookAppointmentForm";
import { getUserByEmail } from "@/helpers/customer";
import { useRouter } from "next/navigation";
import CustomerInfoCard from "./components/CustomerInfoCard";

const AppointmentPage = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [isCustomerNotFound, setIsCustomerNotFound] = useState(false);
  const [existingCustomer, setExistingCustomer] =
    useState<CustomerEnquiriesType | null>(null);
  const [customerFormData, setCustomerFormData] =
    useState<CustomerEnquiriesType | null>(null);

  const handleCheckCustomer = async (email: string) => {
    const customer = getUserByEmail(email);

    if (customer && customer._id) {
      setExistingCustomer(customer);
      setShowModal(false);
      setIsCustomerNotFound(false);
    } else {
      setIsCustomerNotFound(true);
    }
  };

  const handleCreateCustomer = (data: CustomerEnquiriesType) => {
    setCustomerFormData(data);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.back();
  };

  const handleCreateAppointment = async (data: any) => {
    if (customerFormData) {
      await fetch("/api/customers/create", {
        method: "POST",
        body: JSON.stringify(customerFormData),
      });
    }

    await fetch("/api/appointments/create", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        customerId: existingCustomer?._id ?? "newly-created-id",
      }),
    });

    alert("Appointment Booked!");
  };

  return (
    <>
      <CheckCustomerModal
        show={showModal}
        onClose={handleCloseModal}
        onCheck={handleCheckCustomer}
        isCustomerNotFound={isCustomerNotFound}
      />

      {existingCustomer && <CustomerInfoCard customerInfo={existingCustomer} />}

      {(existingCustomer || customerFormData) && (
        <BookAppointmentForm onSubmitHandler={handleCreateAppointment} />
      )}
    </>
  );
};

export default AppointmentPage;
