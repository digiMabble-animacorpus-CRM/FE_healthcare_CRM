"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Col, Row } from "react-bootstrap";
import TextFormInput from "@/components/from/TextFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import type { StaffType } from "@/types/data";

const PersonalInfo = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<StaffType>();

  return (
    <div className="mb-4">
      <h5 className="mb-3">Personal Information</h5>
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="name"
              label="Full Name"
              placeholder="Enter full name"
            />
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="email"
              type="email"
              label="Email"
              placeholder="Enter email"
            />
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter 10-digit number"
              type="tel"
            />
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="dob"
              type="date"
              label="Date of Birth"
            />
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Gender <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <ChoicesFormInput className="form-control" {...field}>
                  <option value="" disabled hidden>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </ChoicesFormInput>
              )}
            />
            {errors.gender && (
              <small className="text-danger">{errors.gender.message}</small>
            )}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <TextAreaFormInput
              control={control}
              name="description"
              label="Description"
              rows={3}
              placeholder="Short introduction or notes"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PersonalInfo;
