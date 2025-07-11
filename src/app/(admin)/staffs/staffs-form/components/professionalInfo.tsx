"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Col, Row } from "react-bootstrap";
import TextFormInput from "@/components/from/TextFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import type { StaffType } from "@/types/data";

const ProfessionalInfo = () => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<StaffType>();
  const role = watch("role");

  // Roles that require specialization & experience
  const requiresDetails = [
    "Doctor",
    "Therapist",
    "Nurse",
    "Pharmacist",
    "Technician",
    "LabTechnician",
  ];

  return (
    <div className="mb-4">
      <h5 className="mb-3">Professional Information</h5>
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Role <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <ChoicesFormInput className="form-control" {...field}>
                  <option value="" disabled hidden>
                    Select Role
                  </option>
                  <option value="Doctor">Doctor</option>
                  <option value="Therapist">Therapist</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Technician">Technician</option>
                  <option value="SupportStaff">Support Staff</option>
                  <option value="LabTechnician">Lab Technician</option>
                  <option value="Other">Other</option>
                </ChoicesFormInput>
              )}
            />

            {errors.role && (
              <small className="text-danger">{errors.role.message}</small>
            )}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Access Level <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="accessLevel"
              render={({ field }) => (
                <ChoicesFormInput className="form-control" {...field}>
                  <option value="" disabled hidden>
                    Select Access Level
                  </option>
                  <option value="staff">Staff</option>
                  <option value="branch-admin">Branch Admin</option>
                  <option value="super-admin">Super Admin</option>
                </ChoicesFormInput>
              )}
            />

            {errors.accessLevel && (
              <small className="text-danger">
                {errors.accessLevel.message}
              </small>
            )}
          </div>
        </Col>

        {requiresDetails.includes(role) && (
          <>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  required
                  control={control}
                  name="specialization"
                  label="Specialization"
                  placeholder="e.g. Physiotherapy"
                />
              </div>
            </Col>

            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  required
                  control={control}
                  name="experience"
                  label="Experience"
                  placeholder="e.g. 5 years"
                />
              </div>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default ProfessionalInfo;
