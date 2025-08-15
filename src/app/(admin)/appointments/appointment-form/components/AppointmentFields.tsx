"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Row, Col, Button, Form } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Add this to your global css imports
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import { useEffect } from "react";

const services = [
  { key: "consultation", label: "Consultation" },
  { key: "demo", label: "Demo" },
  { key: "meeting", label: "Meeting" },
];

export const departments = [
  { key: "physiotherapy", label: "Physiotherapy" },
  { key: "fitness", label: "Fitness" },
  { key: "nutrition", label: "Nutrition" },
  { key: "counseling", label: "Counseling" },
  { key: "sports-medicine", label: "Sports Medicine" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
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
    // Set today as default date on mount if not already set
    if (!selectedDate) {
      const today = new Date();
      setValue("date", today.toISOString().split("T")[0]);
      trigger("date");
    }
  }, []);

  return (
    <Row>
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
                onChange={date => {
                  // date is JS Date, convert to yyyy-mm-dd string
                  const formattedDate = date instanceof Date && !isNaN(date.getTime())
                    ? date.toISOString().split("T")
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
              {String(errors.time.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Service / Purpose</Form.Label>
          <Controller
            control={control}
            name="service"
            render={({ field }) => (
              <ChoicesFormInput className="form-control" {...field}>
                <option value="" disabled hidden>Select Service</option>
                {services.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </ChoicesFormInput>
            )}
          />
          {errors.service && (
            <Form.Text className="text-danger">
              {String(errors.service.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Department</Form.Label>
          <Controller
            control={control}
            name="department"
            render={({ field }) => (
              <ChoicesFormInput className="form-control" {...field}>
                <option value="" disabled hidden>Select Department</option>
                {departments.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </ChoicesFormInput>
            )}
          />
          {errors.department && (
            <Form.Text className="text-danger">
              {String(errors.department.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      <Col lg={12}>
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
