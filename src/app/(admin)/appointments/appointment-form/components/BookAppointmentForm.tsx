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
import { useEffect, useState } from "react";
import AppointmentFields from "./AppointmentFields";

// ---------------- Types ----------------
export type AppointmentFormValues = {
  branchId: number;
  departmentId: number;
  specializationId: number;
  therapistKey: number;
  patientId?: string; // optional here because BookAppointmentForm injects
  date: string;
  time: string; // HH:mm
  purposeOfVisit: string;
  notes?: string;
};

const schema = yup.object({
  branchId: yup.number().required("Select branch"),
  departmentId: yup.number().required("Select department"),
  specializationId: yup.number().required("Select specialization"),
  therapistKey: yup.number().required("Select therapist"),
  date: yup.string().required("Select date"),
  time: yup.string().required("Select time"),
  purposeOfVisit: yup.string().required("Select service"),
  notes: yup.string().optional(),
});

// ---------------- Props ----------------
interface Props {
  defaultValues?: Partial<AppointmentFormValues>;
  onSubmitHandler?: (data: AppointmentFormValues) => void;
  isEditMode?: boolean;
  appointmentId?: number;
  patientId: string;
  createdById: string;
  modifiedById?: string;
  selectedCustomer?: CustomerEnquiriesType;
}

// ---------------- Component ----------------
const BookAppointmentForm = ({
  defaultValues,
  onSubmitHandler,
  isEditMode = false,
  appointmentId,
  patientId,
  createdById,
  modifiedById,
  selectedCustomer,
}: Props) => {
  const [saving, setSaving] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const methods = useForm<AppointmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      branchId: defaultValues?.branchId ?? 0,
      departmentId: defaultValues?.departmentId ?? 0,
      specializationId: defaultValues?.specializationId ?? 0,
      therapistKey: defaultValues?.therapistKey ?? 0,
      date: defaultValues?.date ?? "",
      time: defaultValues?.time ?? "",
      purposeOfVisit: defaultValues?.purposeOfVisit ?? "",
      notes:
        defaultValues?.notes ??
        (selectedCustomer?.name
          ? `Booking for ${selectedCustomer.name}`
          : ""),
    },
  });

  const { handleSubmit, reset } = methods;

  // Prefill on Edit Mode
  useEffect(() => {
    if (isEditMode && defaultValues) {
      reset({
        branchId: defaultValues.branchId ?? 0,
        departmentId: defaultValues.departmentId ?? 0,
        specializationId: defaultValues.specializationId ?? 0,
        therapistKey: defaultValues.therapistKey ?? 0,
        date: defaultValues.date ?? "",
        time: defaultValues.time ?? "",
        purposeOfVisit: defaultValues.purposeOfVisit ?? "",
        notes: defaultValues.notes ?? "",
      });
    }
  }, [isEditMode, defaultValues, reset]);

  const onSubmit = async (data: AppointmentFormValues) => {
    // 👉 Console the raw form data
    console.log("📝 Appointment Form Data:", data);

    const payload = {
      patientId,
      branchId: data.branchId,
      departmentId: data.departmentId,
      specializationId: data.specializationId,
      therapistKey: data.therapistKey,
      date: data.date,
      timeslot: `${data.time} - ${getEndTime(data.time)}`,
      purposeOfVisit: data.purposeOfVisit,
      description: data.notes || "",
      ...(isEditMode ? { modifiedById } : { createdById }),
    };

    console.log("📦 API Payload:", payload);

    try {
      setSaving(true);
      const res = await fetch(
        `${API_BASE_PATH}/appointments${isEditMode && appointmentId ? `/${appointmentId}` : ""}`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save appointment");
      const responseData = await res.json();

      console.log("✅ Appointment Saved Response:", responseData);

      onSubmitHandler?.(data);
    } catch (error) {
      console.error("❌ API Error:", error);
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
                Booking for:{" "}
                <strong>
                  {selectedCustomer.name ||
                    selectedCustomer.email ||
                    selectedCustomer.number}
                </strong>
              </small>
            )}
          </CardHeader>
          <CardBody>
            {/* 🔹 All appointment fields here */}
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

/** Helper: generate end time (+30min) */
function getEndTime(startTime: string) {
  const [hour, minute] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  date.setMinutes(date.getMinutes() + 30);
  return date.toTimeString().slice(0, 5); // HH:mm
}

export default BookAppointmentForm;
