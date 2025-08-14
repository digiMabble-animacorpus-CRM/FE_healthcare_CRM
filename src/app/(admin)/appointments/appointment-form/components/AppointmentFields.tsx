"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Row, Col, Button, Form } from "react-bootstrap";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import TextFormInput from "@/components/from/TextFormInput";

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
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const selectedTime = watch("time");

  return (
    <>
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Form.Group>
                  <Form.Label>Appointment Date</Form.Label>
                  <Form.Control
                    type="date"
                    {...field}
                    min={new Date().toISOString().split("T")[0]}
                    isInvalid={!!errors.date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {String(errors.date?.message)}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            />
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
                    trigger("time"); // ✅ remove validation error if time selected
                  }}
                >
                  {slot}
                </Button>
              ))}
            </div>
            {errors.time && (
              <small className="text-danger">{String(errors.time.message)}</small>
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
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </ChoicesFormInput>
              )}
            />
            {errors.service && (
              <small className="text-danger">{String(errors.service.message)}</small>
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
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </ChoicesFormInput>
              )}
            />
            {errors.department && (
              <small className="text-danger">{String(errors.department.message)}</small>
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
    </>
  );
};

export default AppointmentFields;
