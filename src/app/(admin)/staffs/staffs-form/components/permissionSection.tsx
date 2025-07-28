"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Row, Col, FormCheck } from "react-bootstrap";
import type { StaffType } from "@/types/data";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import { getAllRoles } from "@/helpers/staff";
import { getAllPermissions } from "@/helpers/permission";

const PermissionsSection = () => {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<StaffType>();

  const allRoles        = useMemo(() => getAllRoles(), []);
  const allPermissions  = useMemo(() => getAllPermissions(), []);

  const roleId              = useWatch({ name: "roleId" });
  const selectedPermissions = useWatch({ name: "permissions" }) || [];

  const [defaultKeys, setDefaultKeys] = useState<string[]>([]);

  const permissionLabels = useMemo(() => {
    const map: Record<string, string> = {};
    allPermissions.forEach((p) => (map[p.key] = p.label));
    return map;
  }, [allPermissions]);

 
  useEffect(() => {
    const role = allRoles.find((r) => r._id === roleId);
    setDefaultKeys(role?.defaultPermissions || []);
  }, [roleId, allRoles]);

  
  useEffect(() => {
    if (!selectedPermissions) return; 

    const currentKeys = selectedPermissions.map((p: any) => p._id);
    const mergedKeys  = Array.from(new Set([...defaultKeys, ...currentKeys]));

    const merged = mergedKeys.map((key) => {
      const existing = selectedPermissions.find((p: any) => p._id === key);
      return { _id: key, enabled: existing ? existing.enabled : false };
    });

    setValue("permissions", merged);
  }, [defaultKeys, selectedPermissions]);

 
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
    const updated = val.map((key) => ({ _id: key, enabled: true }));
    setValue("permissions", updated);
  };

  /* render ----------------------------------------------------------- */
  return (
    <div className="mb-4">
      <h5 className="mb-3">
        Permissions <span className="text-danger">*</span>
      </h5>

      {/* multi-select dropdown */}
      <Controller
        control={control}
        name="permissions"
        render={() => (
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

      {/* check-box list */}
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
