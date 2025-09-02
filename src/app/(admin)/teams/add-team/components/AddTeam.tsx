'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

import { getAllBranch } from '@/helpers/branch';
import type { TeamMemberCreatePayload } from '@/types/data';
import { createTeamMember, getTeamMemberById, updateTeamMember } from '@/helpers/team-members';

// --- Types ---

export type Role = 'super_admin' | 'admin' | 'staff';

export interface PermissionModuleAction {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionModules {
  [module: string]: PermissionModuleAction;
}

export interface TeamsFormValues {
  firstName: string;
  lastName: string;
  role: Role;
  branchIds: number[]; // always number[]
  primaryBranchId: number | ''; // use '' as empty for <select> compatibility
  permissions: PermissionModules;
  status: 'active' | 'inactive';
  contactEmail: string;
  contactPhone: string;
  aboutMe?: string;
  // Add any additional required fields from TeamMemberCreatePayload here
  whoAmI: string;
  consultations: string;
  officeAddress: string;
  website?: string;
  paymentMethods?: string[];
  diplomasAndTraining?: string[];
  specializations?: string[];
  calendarLinks?: string[];
  photo?: string;
  teamId?: string;
  // For branch & permissions integration:
  selectedBranch?: number | string | null;
}

// --- Default Permission Template ---

const defaultPermissionModules: PermissionModules = {
  appointments: { view: false, create: false, edit: false, delete: false },
  patients: { view: false, create: false, edit: false, delete: false },
  billing: { view: false, create: false, edit: false, delete: false },
  teams: { view: false, create: false, edit: false, delete: false },
};

// --- Validation Schema using function form of .when() ---

const teamMemberSchema = yup.object({
  firstName: yup.string().required('Please enter first name'),
  lastName: yup.string().required('Please enter last name'),
  role: yup
    .mixed<Role>()
    .oneOf(['super_admin', 'admin', 'staff'], 'Please select a valid role')
    .required('Role is required'),
  branchIds: yup
    .array()
    .of(yup.number().required())
    .default([])
    .when('role', (roleValue: Role, schema: any) => {
      return roleValue !== 'super_admin'
        ? schema.min(1, 'Select at least one branch')
        : schema.max(0);
    }),
  primaryBranchId: yup
  .mixed<number | ''>()
  .nullable()
  .default('')
  .when('role', (roleValue: Role, schema) => {
    if (typeof roleValue === 'string' && roleValue !== 'super_admin') {
      return schema
        .notOneOf([''], 'Primary branch is required')
        .required('Primary branch is required');
    }
    return schema.notRequired().nullable();
  }),

  permissions: yup.object().when('role', (roleValue: Role, schema: any) => {
    return roleValue === 'admin' || roleValue === 'staff'
      ? schema.required('Permissions are required')
      : schema.notRequired();
  }),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Status is required'),
  contactEmail: yup.string().email('Invalid email').required('Email required'),
  contactPhone: yup.string().required('Phone number required'),
  aboutMe: yup.string().optional(),
  whoAmI: yup.string().required('Biography/About me is required'),
  consultations: yup.string().required('Consultations info is required'),
  officeAddress: yup.string().required('Office address is required'),
  website: yup.string().url('Enter valid URL').optional(),
  paymentMethods: yup.array().of(yup.string()).optional(),
  diplomasAndTraining: yup.array().of(yup.string()).optional(),
  specializations: yup.array().of(yup.string()).optional(),
  calendarLinks: yup.array().of(yup.string().url('Enter valid URL')).optional(),
  photo: yup.string().url('Enter valid URL').optional(),
  teamId: yup.string().optional(),
});

// --- Payload Mapper (conforming with TeamMemberCreatePayload) ---

function mapToPayload(form: TeamsFormValues): TeamMemberCreatePayload {
  return {
    teamId: form.teamId || '', // could be '' for new create or set for update
    lastName: form.lastName,
    firstName: form.firstName,
    fullName: `${form.firstName} ${form.lastName}`,
    job1: undefined,
    specificAudience: undefined,
    specialization1: undefined,
    job2: undefined,
    job3: undefined,
    job4: undefined,
    whoAmI: form.whoAmI,
    consultations: form.consultations,
    officeAddress: form.officeAddress,
    contactEmail: form.contactEmail,
    contactPhone: form.contactPhone,
    schedule: { text: null },
    about: form.aboutMe || null,
    languagesSpoken: [], // Fill if needed
    paymentMethods: form.paymentMethods || [],
    diplomasAndTraining: form.diplomasAndTraining || [],
    specializations: form.specializations || [],
    website: form.website || '',
    frequentlyAskedQuestions: null,
    calendarLinks: form.calendarLinks || [],
    photo: form.photo || '',
    branches: form.branchIds,
    selected_branch: typeof form.primaryBranchId === 'number' ? form.primaryBranchId : null,
    permissions: form.permissions,
    status: form.status,
  };
}

// --- Form Component ---

interface Props {
  params?: { id?: string };
  onSubmitHandler?: (data: TeamMemberCreatePayload) => void;
}

const AddTeamMember = ({ params, onSubmitHandler }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [defaultValues, setDefaultValues] = useState<TeamsFormValues>({
    firstName: '',
    lastName: '',
    role: 'staff',
    branchIds: [],
    primaryBranchId: '',
    permissions: defaultPermissionModules,
    status: 'active',
    contactEmail: '',
    contactPhone: '',
    aboutMe: '',
    whoAmI: '',
    consultations: '',
    officeAddress: '',
    website: '',
    paymentMethods: [],
    diplomasAndTraining: [],
    specializations: [],
    calendarLinks: [],
    photo: '',
    teamId: '',
  });

  // Fetch branches asynchronously (example below simulates API fetch)
  useEffect(() => {
    async function fetchBranches() {
      const fetchedBranches = await Promise.resolve(getAllBranch());
      setBranches(fetchedBranches);
    }
    fetchBranches();
  }, []);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeamsFormValues>({
    resolver: yupResolver(teamMemberSchema),
    defaultValues,
    mode: 'all',
  });

  const role = watch('role');
  const branchIds = watch('branchIds');
  const permissions = watch('permissions');

  // Load existing data when editing
  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getTeamMemberById(params.id)
        .then((tm) => {
          if (tm) {
            reset({
              firstName: tm.first_name,
              lastName: tm.last_name,
              role: (tm.role as Role) || 'staff',
              branchIds: tm.branch_ids === '*' ? [] : (tm.branch_ids as number[]),
              primaryBranchId: tm.primary_branch_id ?? '',
              permissions: tm.permissions || defaultPermissionModules,
              status: tm.status === 'active' ? 'active' : 'inactive',
              contactEmail: tm.contact_email,
              contactPhone: tm.contact_téléphone,
              aboutMe: tm.qui_suis_je || '',
              whoAmI: tm.who_am_i || '',
              consultations: tm.consultations || '',
              officeAddress: tm.office_address || '',
              website: tm.website || '',
              paymentMethods: tm.payment_methods || [],
              diplomasAndTraining: tm.diplomas_and_training || [],
              specializations: tm.specializations || [],
              calendarLinks: tm.calendar_links || [],
              photo: tm.photo || '',
              teamId: tm.team_id || '',
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  // Handle toggling permissions checkboxes
  const togglePermission = (module: string, action: keyof PermissionModuleAction, value: boolean) => {
    const current = permissions || {};
    const updated = {
      ...current,
      [module]: {
        ...current[module],
        [action]: value,
      },
    };
    setValue('permissions', updated);
  };

  // Clear primary branch if no longer selected
  useEffect(() => {
    if (branchIds.length === 0) {
      setValue('primaryBranchId', '');
    } else {
      const primary = watch('primaryBranchId');
      if (primary !== '' && !branchIds.includes(primary as number)) {
        setValue('primaryBranchId', '');
      }
    }
  }, [branchIds, setValue, watch]);

  const onSubmit: SubmitHandler<TeamsFormValues> = async (data) => {
    const payload = mapToPayload(data);
    let success = false;
    if (isEditMode && params?.id) {
      success = await updateTeamMember(params.id, payload);
    } else {
      success = await createTeamMember(payload);
    }

    if (success) {
      alert(`Team member ${isEditMode ? 'updated' : 'created'} successfully!`);
      router.back();
      onSubmitHandler && onSubmitHandler(payload);
    } else {
      alert('Failed to save team member');
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  // Render
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* First Name */}
            <Col lg={6} className="mb-3">
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="firstName" className="form-label">
                      First Name *
                    </label>
                    <input id="firstName" className="form-control" {...field} placeholder="Enter First Name" />
                    {errors.firstName && <small className="text-danger">{errors.firstName.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* Last Name */}
            <Col lg={6} className="mb-3">
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="lastName" className="form-label">
                      Last Name *
                    </label>
                    <input id="lastName" className="form-control" {...field} placeholder="Enter Last Name" />
                    {errors.lastName && <small className="text-danger">{errors.lastName.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* Role */}
            <Col lg={6} className="mb-3">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="role" className="form-label">
                      Role *
                    </label>
                    <select id="role" className="form-select" {...field}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                    {errors.role && <small className="text-danger">{errors.role.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* Branches */}
            {role !== 'super_admin' && (
              <Col lg={6} className="mb-3">
                <Controller
                  name="branchIds"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label htmlFor="branchIds" className="form-label">
                        Branches *
                      </label>
                      <select
                        multiple
                        id="branchIds"
                        className="form-select"
                        size={branches.length}
                        value={field.value?.map(String) || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value));
                          field.onChange(selected);
                        }}
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      {errors.branchIds && <small className="text-danger">{errors.branchIds.message}</small>}
                    </>
                  )}
                />
              </Col>
            )}

            {/* Primary Branch */}
            {role !== 'super_admin' && branchIds.length > 0 && (
              <Col lg={6} className="mb-3">
                <Controller
                  name="primaryBranchId"
                  control={control}
                  render={({ field }) => {
                    // Cast value to string for select compatibility — '' means no selection
                    const val = field.value === '' ? '' : String(field.value);
                    return (
                      <>
                        <label htmlFor="primaryBranchId" className="form-label">
                          Primary Branch *
                        </label>
                        <select
                          id="primaryBranchId"
                          className="form-select"
                          {...field}
                          value={val}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === '' ? '' : Number(v));
                          }}
                        >
                          <option value="">Select primary branch</option>
                          {branchIds.map((id) => {
                            const branch = branches.find((b) => b.id === id);
                            if (!branch) return null;
                            return (
                              <option key={id} value={branch.id}>
                                {branch.name}
                              </option>
                            );
                          })}
                        </select>
                        {errors.primaryBranchId && <small className="text-danger">{errors.primaryBranchId.message}</small>}
                      </>
                    );
                  }}
                />
              </Col>
            )}

            {/* Permissions */}
            {(role === 'admin' || role === 'staff') && branchIds.length > 0 && (
              <Col lg={12} className="mb-3">
                <fieldset>
                  <legend>Permissions</legend>
                  {Object.entries(defaultPermissionModules).map(([module]) => (
                    <div key={module} className="mb-2">
                      <strong>{module.charAt(0).toUpperCase() + module.slice(1)}</strong>
                      {(['view', 'create', 'edit', 'delete'] as (keyof PermissionModuleAction)[]).map((action) => (
                        <label key={`${module}-${action}`} className="me-3 ms-2">
                          <input
                            type="checkbox"
                            checked={permissions?.[module]?.[action] || false}
                            onChange={(e) => togglePermission(module, action, e.target.checked)}
                            disabled={role === 'admin' && action === 'delete'}
                          />{' '}
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </label>
                      ))}
                    </div>
                  ))}
                </fieldset>
              </Col>
            )}

            {/* Contact Email */}
            <Col lg={6} className="mb-3">
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="contactEmail" className="form-label">
                      Email *
                    </label>
                    <input id="contactEmail" type="email" className="form-control" placeholder="Enter Email" {...field} />
                    {errors.contactEmail && <small className="text-danger">{errors.contactEmail.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* Contact Phone */}
            <Col lg={6} className="mb-3">
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="contactPhone" className="form-label">
                      Phone *
                    </label>
                    <input id="contactPhone" className="form-control" placeholder="Enter Phone Number" {...field} />
                    {errors.contactPhone && <small className="text-danger">{errors.contactPhone.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* About Me */}
            <Col lg={12} className="mb-3">
              <Controller
                name="aboutMe"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="aboutMe" className="form-label">
                      About Me
                    </label>
                    <textarea id="aboutMe" className="form-control" rows={3} placeholder="Describe the team member" {...field} />
                  </>
                )}
              />
            </Col>

            {/* Who Am I (Biography) */}
            <Col lg={12} className="mb-3">
              <Controller
                name="whoAmI"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="whoAmI" className="form-label">
                      Biography / About Me *
                    </label>
                    <textarea id="whoAmI" className="form-control" rows={3} placeholder="Share biography or bio" {...field} />
                    {errors.whoAmI && <small className="text-danger">{errors.whoAmI.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* Consultations */}
            <Col lg={12} className="mb-3">
              <Controller
                name="consultations"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="consultations" className="form-label">
                      Consultations *
                    </label>
                    <textarea id="consultations" className="form-control" rows={3} placeholder="Example issues handled" {...field} />
                    {errors.consultations && <small className="text-danger">{errors.consultations.message}</small>}
                  </>
                )}
              />
            </Col>

            {/* Status */}
            <Col lg={6} className="mb-3">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <>
                    <label htmlFor="status" className="form-label">
                      Status *
                    </label>
                    <select id="status" className="form-select" {...field}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && <small className="text-danger">{errors.status.message}</small>}
                  </>
                )}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Row className="mt-3 justify-content-end">
        <Col lg={2}>
          <Button type="submit" variant="primary" className="w-100">
            {isEditMode ? 'Update' : 'Create'} Team Member
          </Button>
        </Col>
        <Col lg={2}>
          <Button variant="danger" className="w-100" onClick={() => router.back()}>
            Cancel
          </Button>
        </Col>
      </Row>
    </form>
  );
};

export default AddTeamMember;
