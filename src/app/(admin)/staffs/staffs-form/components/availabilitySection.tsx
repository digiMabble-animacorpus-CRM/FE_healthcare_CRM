"use client";

import {
  useFormContext,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Button, Col, Row } from "react-bootstrap";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import TextFormInput from "@/components/from/TextFormInput";
import type { StaffType } from "@/types/data";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AvailabilitySection = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<StaffType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "availability",
  });

  const currentAvailability = useWatch({ control, name: "availability" }) || [];

  // Get selected days to avoid duplication
  const selectedDays = currentAvailability
    .map((slot: any) => slot?.day)
    .filter(Boolean);

  return (
    <div className="mb-4">
      <h5 className="mb-3">Availability</h5>

      {fields.map((field, index) => (
        <Row key={field.id} className="mb-2 align-items-end gx-2">
          <Col md={4} className="mb-2 mb-md-0">
            <Controller
              control={control}
              name={`availability.${index}.day`}
              render={({ field }) => (
                <>
                  <label className="form-label d-block">Day</label>
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select
                    </option>
                    {weekDays.map((day) => (
                      <option
                        key={day}
                        value={day}
                        disabled={
                          selectedDays.includes(day) &&
                          day !== currentAvailability[index]?.day
                        }
                      >
                        {day}
                      </option>
                    ))}
                  </ChoicesFormInput>
                </>
              )}
            />
          </Col>

          <Col md={3} className="mb-2 mb-md-0">
            <TextFormInput
              required
              control={control}
              name={`availability.${index}.from`}
              label="From"
              type="time"
            />
          </Col>

          <Col md={3} className="mb-2 mb-md-0">
            <TextFormInput
              required
              control={control}
              name={`availability.${index}.to`}
              label="To"
              type="time"
            />
          </Col>

          <Col md={2}>
            <Button
              variant="outline-danger"
              className="w-100"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </Col>
        </Row>
      ))}

      <div className="mt-3">
        {selectedDays.length < weekDays.length && (
          <Button
            variant="outline-primary"
            onClick={() => append({ day: "", from: "", to: "" })}
          >
            + Add Another
          </Button>
        )}

        {errors.availability && (
          <small className="text-danger2 d-block mt-2">
            {(errors.availability as any)?.message}
          </small>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySection;
