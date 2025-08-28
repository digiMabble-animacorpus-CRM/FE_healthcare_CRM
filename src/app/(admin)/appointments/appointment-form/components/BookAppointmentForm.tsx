"use client";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Spinner,
} from "react-bootstrap";
import { API_BASE_PATH } from "@/context/constants";
import type { CustomerEnquiriesType } from "@/types/data";
import { useState } from "react";
import AppointmentFields from "./AppointmentFields";

type AppointmentFormValues = {
  date: string;
  time: string;
  purposeOfVisit: string;
  therapistKey: number; // optional, used for edit mode
  department: string;
  notes?: string;
};

const schema = yup.object({
  date: yup.string().required("Select date"),
  time: yup.string().required("Select time"),
  department: yup.string().required("Select department"),
  purposeOfVisit: yup.string().required("Select service"),
  therapistKey: yup.number().required("Select therapist"),
  notes: yup.string().optional(),
});

interface Props {
  defaultValues?: Partial<AppointmentFormValues>;
  onSubmitHandler?: (data: AppointmentFormValues) => void;
  isEditMode?: boolean;
  appointmentId?: number; // needed for edit
  patientId: string; // mandatory for both create & edit
  createdById: string; // mandatory for create
  modifiedById?: string; // mandatory for edit
  selectedCustomer?: CustomerEnquiriesType; // for context/prefill
}

const BookAppointmentForm = ({
  defaultValues,
  onSubmitHandler,
  isEditMode,
  appointmentId,
  patientId,
  createdById,
  modifiedById,
  selectedCustomer,
}: Props) => {
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('access_token');

  const methods = useForm<AppointmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: "",
      time: "",
      purposeOfVisit: "",
      department: "",
      therapistKey: undefined,
      notes: selectedCustomer?.name
        ? `Booking for ${selectedCustomer.name}`
        : "",
      ...defaultValues,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: AppointmentFormValues) => {
    const payload = {
      patientId,
      date: data.date,
      timeslot: `${data.time} - ${getEndTime(data.time)}`,
      purposeOfVisit: data.purposeOfVisit,
      department: data.department,
      therapistKey: data.therapistKey,
      description: data.notes || "",
      ...(isEditMode ? { modifiedById } : { createdById }),
    };

    try {
      setSaving(true);
      console.log("Submitting appointment data:", payload);

      const res = await fetch(
        `${API_BASE_PATH}/appointments${
          isEditMode && appointmentId ? `/${appointmentId}` : ""
        }`,
        {
          method: isEditMode ? "PUT" : "POST",
           headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save appointment");
      await res.json(); // if you need the created entity, keep it

      onSubmitHandler?.(data);
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to save appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-4">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h6">
              {isEditMode ? "Edit Appointment" : "Book Appointment"}
            </CardTitle>
            {selectedCustomer && (
              <small className="text-muted">
                Booking for: <strong>{selectedCustomer.name || selectedCustomer.email || selectedCustomer.number}</strong>
              </small>
            )}
          </CardHeader>
          <CardBody>
            <AppointmentFields />
            <div className="d-flex justify-content-end mt-4">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <Spinner animation="border" size="sm" />
                ) : isEditMode ? (
                  "Update Appointment"
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

/** Helper: generate end time (assumes +30min slot) */
function getEndTime(startTime: string) {
  const [hour, minute] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute + 30);
  return date.toTimeString().slice(0, 5);
}

export default BookAppointmentForm;
