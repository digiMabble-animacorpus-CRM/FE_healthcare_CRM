"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Row, Col, FormCheck, FormControl, FormLabel } from "react-bootstrap";
import type { StaffType, PermissionType } from "@/types/data";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import { getAllRoles } from "@/helpers/staff";
import { getAllPermissions } from "@/helpers/permission";

const PermissionsSection = () => {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<StaffType>();

  const allRoles = useMemo(() => getAllRoles(), []);
  const allPermissions = useMemo(() => getAllPermissions(), []);

  const roleId = useWatch({ name: "roleId" });
  const selectedPermissions = useWatch({ name: "permissions" }) || [];

  const [defaultKeys, setDefaultKeys] = useState<string[]>([]);

  const permissionLabels = useMemo(() => {
    const map: Record<string, string> = {};
    allPermissions.forEach((p) => (map[p.key] = p.label));
    return map;
  }, [allPermissions]);

  // 🧠 Fetch default permissions based on role
  useEffect(() => {
    const role = allRoles.find((r) => r._id === roleId);
    setDefaultKeys(role?.defaultPermissions || []);
  }, [roleId, allRoles]);

  // 🚀 Merge default + existing selected permissions on change
  useEffect(() => {
    const currentKeys = selectedPermissions.map((p: any) => p._id);
    const mergedKeys = Array.from(new Set([...defaultKeys, ...currentKeys]));
    const mapped = mergedKeys.map((key) => ({ _id: key, enabled: true }));
    setValue("permissions", mapped);
  }, [defaultKeys]);

  const selectedKeys = selectedPermissions
    .filter((p: any) => p.enabled)
    .map((p: any) => p._id);

  const handleToggle = (key: string) => {
    const updated = selectedPermissions.map((p: any) =>
      p._id === key ? { ...p, enabled: !p.enabled } : p
    );
    setValue("permissions", updated);
  };

  const handleSelectChange = (val: string[]) => {
    const updated = val.map((key) => ({
      _id: key,
      enabled: true,
    }));
    setValue("permissions", updated);
  };

  return (
    <div className="mb-4">
      <h5 className="mb-3">
        Permissions <span className="text-danger">*</span>
      </h5>

      {/* ✅ Multi Select Dropdown */}
      <Controller
        control={control}
        name="permissions"
        render={({ field }) => (
          <ChoicesFormInput
            className="form-control"
            multiple
            options={{ removeItemButton: true }}
            value={selectedKeys}
            onChange={(val: any) => handleSelectChange(val as string[])}
          >
            {allPermissions.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </ChoicesFormInput>
        )}
      />

      {/* ✅ Checkbox list below for selected permissions */}
      <Row className="mt-3">
        {selectedKeys.map((key: string) => (
          <Col lg={4} key={key} className="mb-2">
            <FormCheck
              type="checkbox"
              id={key}
              label={permissionLabels[key]}
              checked={
                selectedPermissions.find((p: any) => p._id === key)?.enabled ??
                false
              }
              onChange={() => handleToggle(key)}
            />
          </Col>
        ))}
      </Row>

      {errors.permissions && (
        <small className="text-danger">{errors.permissions.message}</small>
      )}
    </div>
  );
};

export default PermissionsSection;
