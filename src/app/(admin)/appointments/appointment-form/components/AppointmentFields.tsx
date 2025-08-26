"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Row, Col, Button, Form } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import { useEffect } from "react";

// Define your form options (not using enums)
export const PurposeOfVisitOptions = [
  { value: "Consultation", label: "Consultation" },
  { value: "Follow-up", label: "Follow-up" },
  { value: "Therapy Session", label: "Therapy Session" },
  { value: "Initial Assessment", label: "Initial Assessment" },
];

export const DepartmentOptions = [
  { value: "Psychology", label: "Psychology" },
  { value: "Physiotherapy", label: "Physiotherapy" },
  { value: "Nutrition", label: "Nutrition" },
  { value: "General Medicine", label: "General Medicine" },
];

// For therapist (static value as requested)
export const TherapistOptions = [
  { value: 1, label: "Dr. Smith" },
  { value: 2, label: "Dr. Johnson" },
  { value: 3, label: "Dr. Williams" },
];

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const AppointmentFields = () => {
  const {
    control,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedDate = watch("date");
  const selectedTime = watch("time");

  useEffect(() => {
    // Set today's date if not already set (string format: YYYY-MM-DD)
    if (!selectedDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const iso = `${yyyy}-${mm}-${dd}`;
      setValue("date", iso);
      trigger("date");
    }
  }, [selectedDate, setValue, trigger]);
  {
    console.log("Errors:", errors);
  }

  return (
    <Row>
      {/* Appointment Date */}
      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Appointment Date</Form.Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Calendar
                {...field}
                value={field.value ? new Date(field.value) : new Date()}
                minDate={new Date()}
                onChange={(date) => {
                  const formattedDate =
                    date instanceof Date && !isNaN(date.getTime())
                      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                      : "";
                  field.onChange(formattedDate);
                  setValue("date", formattedDate);
                  trigger("date");
                }}
                locale="en-GB"
              />
            )}
          />
          {errors.date && (
            <Form.Text className="text-danger">
              {String(errors.date?.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      {/* Time Slot */}
      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Select Time</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                variant={selectedTime === slot ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => {
                  setValue("time", slot);
                  trigger("time");
                }}
              >
                {slot}
              </Button>
            ))}
          </div>
          {errors.time && (
            <Form.Text className="text-danger">
              {String(errors.time?.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      {/* Service */}
      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Service / Purpose</Form.Label>
          <Controller
            control={control}
            name="purposeOfVisit"
            render={({ field }) => (
              <ChoicesFormInput className="form-control" {...field}>
                <option value="" disabled hidden>
                  Select Service
                </option>
                {PurposeOfVisitOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </ChoicesFormInput>
            )}
          />
          {errors.purposeOfVisit && (
            <Form.Text className="text-danger">
              {String(errors.purposeOfVisit?.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      {/* Department */}
      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Department</Form.Label>
          <Controller
            control={control}
            name="department"
            render={({ field }) => (
              <ChoicesFormInput className="form-control" {...field}>
                <option value="" disabled hidden>
                  Select Department
                </option>
                {DepartmentOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </ChoicesFormInput>
            )}
          />
          {errors.department && (
            <Form.Text className="text-danger">
              {String(errors.department?.message)}
            </Form.Text>
          )}
        </div>
      </Col>
      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Therapist</Form.Label>
          <Controller
            control={control}
            name="therapistKey"
            render={({ field }) => (
              <ChoicesFormInput className="form-control" {...field}>
                <option value="" disabled hidden>
                  Select Therapist
                </option>
                {TherapistOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </ChoicesFormInput>
            )}
          />
          {errors.therapistKey && (
            <Form.Text className="text-danger">
              {String(errors.therapistKey?.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      {/* Notes */}
      <Col lg={6}>
        <div className="mb-3">
          <TextAreaFormInput
            control={control}
            name="notes"
            label="Notes"
            rows={3}
            placeholder="Additional Notes"
          />
        </div>
      </Col>
    </Row>
  );
};

export default AppointmentFields;
