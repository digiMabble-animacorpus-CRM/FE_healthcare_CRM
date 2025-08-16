'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Row, Col, FormCheck } from 'react-bootstrap';
import type { StaffType, PermissionType, StaffRoleType } from '@/types/data';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import { staffRoleData } from '@/assets/data/staffRoleData';

const PermissionsSection = () => {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<StaffType>();

  const roleId = useWatch({ name: 'roleId' });
  const selectedPermissions = useWatch({ name: 'permissions' }) || [];

  const [defaultKeys, setDefaultKeys] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<StaffRoleType[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionType[]>([]);

  // Fetch roles and permissions once
  useEffect(() => {
    const roles = staffRoleData.filter((r) => r.tag === 'Role');
    setAllRoles(roles);

    const permissionSet = new Set(roles.flatMap((r) => r.defaultPermissions || []));

    // Generate fake permission objects based on roles
    const permissions = Array.from(permissionSet).map((key) => ({
      _id: key,
      key,
      label: key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

    setAllPermissions(permissions);
  }, []);

  // Fetch default permissions based on role
  useEffect(() => {
    const role = allRoles.find((r) => r._id === roleId);
    setDefaultKeys(role?.defaultPermissions || []);
  }, [roleId, allRoles]);

  // Memoized map of key → label
  const permissionLabels = useMemo(() => {
    const map: Record<string, string> = {};
    allPermissions.forEach((p) => (map[p.key] = p.label));
    return map;
  }, [allPermissions]);

  // Selected permission keys
  const selectedKeys = useMemo(
    () => selectedPermissions.filter((p: any) => p.enabled).map((p: any) => p._id),
    [selectedPermissions],
  );

  // Handlers
  const handleToggle = (key: string) => {
    const updated = selectedPermissions.map((p: any) =>
      p._id === key ? { ...p, enabled: !p.enabled } : p,
    );
    setValue('permissions', updated);
  };

  const handleSelectChange = (val: string[]) => {
    const updated = val.map((key) => ({ _id: key, enabled: true }));
    setValue('permissions', updated);
  };

  /* render ----------------------------------------------------------- */
  return (
    <div className="mb-4">
      <h5 className="mb-3">
        Permissions <span className="text-danger">*</span>
      </h5>

      {/* Multi Select Dropdown */}
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

      {/* Checkbox list below for selected permissions */}
      <Row className="mt-3">
        {selectedKeys.map((key: string) => (
          <Col lg={4} key={key} className="mb-2">
            <FormCheck
              type="checkbox"
              id={key}
              label={permissionLabels[key]}
              checked={selectedPermissions.find((p: any) => p._id === key)?.enabled ?? false}
              onChange={() => handleToggle(key)}
            />
          </Col>
        ))}
      </Row>

      {errors.permissions && <small className="text-danger2">{errors.permissions.message}</small>}
    </div>
  );
};

export default PermissionsSection;
