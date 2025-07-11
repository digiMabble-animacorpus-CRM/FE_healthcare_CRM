"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormCheck, Row, Col } from "react-bootstrap";
import type { StaffType, PermissionType } from "@/types/data";

const permissionLabels: Record<PermissionType, string> = {
  "view-patients": "View Patients",
  "edit-patients": "Edit Patients",
  "manage-appointments": "Manage Appointments",
  "prescribe-meds": "Prescribe Medication",
  "manage-inventory": "Manage Inventory",
  "access-billing": "Access Billing",
  "admin-access": "Admin Access",
  "custom": "Custom Permission",
};

const rolePermissions: Record<string, PermissionType[]> = {
  Doctor: ["view-patients", "edit-patients", "prescribe-meds"],
  Therapist: ["view-patients", "edit-patients"],
  Nurse: ["view-patients"],
  Receptionist: ["manage-appointments"],
  Admin: ["admin-access", "manage-inventory", "access-billing"],
  Pharmacist: ["manage-inventory"],
  Technician: ["view-patients"],
  LabTechnician: ["view-patients"],
  SupportStaff: [],
  Other: ["custom"],
};

const PermissionsSection = () => {
  const { setValue } = useFormContext<StaffType>();
  const role = useWatch({ name: "role" });
  const selectedPermissions = useWatch({ name: "permissions" }) || [];

  // Don’t show anything if no role is selected
  if (!role) return null;

  const availableKeys = rolePermissions[role] || [];

  const handleToggle = (key: PermissionType) => {
    const exists = selectedPermissions.find((p: { key: string; }) => p.key === key);
    let updated;
    if (exists) {
      updated = selectedPermissions.map((p: { key: string; enabled: any; }) =>
        p.key === key ? { ...p, enabled: !p.enabled } : p
      );
    } else {
      updated = [...selectedPermissions, { key, enabled: true }];
    }
    setValue("permissions", updated);
  };

  return (
    <div className="mb-4">
      <h5 className="mb-3">Permissions <span className="text-danger">*</span></h5>
      <Row>
        {availableKeys.map((key) => {
          const existing = selectedPermissions.find((p: { key: string; }) => p.key === key);
          const isChecked = existing?.enabled ?? false;
          return (
            <Col lg={4} key={key} className="mb-2">
              <FormCheck
                type="checkbox"
                id={key}
                label={permissionLabels[key]}
                checked={isChecked}
                onChange={() => handleToggle(key)}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default PermissionsSection;
