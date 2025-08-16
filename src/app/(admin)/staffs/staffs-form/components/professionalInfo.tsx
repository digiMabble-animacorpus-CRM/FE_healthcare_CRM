'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import TextFormInput from '@/components/from/TextFormInput';
import type { StaffRoleType, StaffType } from '@/types/data';
import { getAllAccessLevels, getAllRoles } from '@/helpers/staff';
import { staffRoleData } from '@/assets/data/staffRoleData';

const ProfessionalInfo = () => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<StaffType>();

  const roleId = watch('roleId');
  const [roleOptions, setRoleOptions] = useState<StaffRoleType[]>([]);
  const [accessLevelOptions, setAccessLevelOptions] = useState<StaffRoleType[]>([]);

  //  Fetch roles and access levels
  useEffect(() => {
    const accessLevelOptions = staffRoleData.filter((item) => item.tag === 'AccessLevel');
    const roleOptions = staffRoleData.filter((item) => item.tag === 'Role');
    setRoleOptions(roleOptions);
    setAccessLevelOptions(accessLevelOptions);
  }, []);

  const selectedRole = useMemo(() => {
    return roleOptions.find((role) => role._id === roleId);
  }, [roleOptions, roleId]);

  const shouldShowDetails = selectedRole?.requiresDetails;

  return (
    <div className="mb-4">
      <h5 className="mb-3">Professional Information</h5>
      <Row>
        {/* Role */}
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Role <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="roleId"
              render={({ field }) => (
                <select
                  className="form-control"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select Role
                  </option>
                  {roleOptions.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.roleId?.message && (
              <small className="text-danger2">{String(errors.roleId.message)}</small>
            )}
          </div>
        </Col>

        {/* Access Level */}
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Access Level <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="accessLevelId"
              render={({ field }) => (
                <select
                  className="form-control"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select Access Level
                  </option>
                  {accessLevelOptions.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.accessLevelId?.message && (
              <small className="text-danger2">{String(errors.accessLevelId.message)}</small>
            )}
          </div>
        </Col>

        {/* Conditional: Specialization & Experience */}
        {shouldShowDetails && (
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
