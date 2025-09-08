'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Form,
} from 'react-bootstrap';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Form,
} from 'react-bootstrap';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  updateTeamMember,
} from '@/helpers/team-members';
import { TeamMemberType } from '@/types/data';
import { useNotificationContext } from '@/context/useNotificationContext';

export interface AddTeamProps {
  defaultValues?: TeamMemberType;
  isEdit?: boolean;
}

const PERMISSIONS_MODULES = ['appointments', 'patients', 'billing', 'teams'];
const ACTIONS = ['view', 'create', 'edit', 'delete'];
const SCHEDULE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const SCHEDULE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const LANGUAGES = ['English', 'French', 'Spanish'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Bank Transfer'];
const BRANCHES = [
  { id: 1, name: 'Central London' },
  { id: 2, name: 'East Side' },
  { id: 3, name: 'North Branch' },
];

function renderPermissions(
  permissions: Record<string, Record<string, boolean>>,
  setValue: (name: 'permissions', value: Record<string, Record<string, boolean>>) => void,
  errors: any
) {
  return (
    <Form.Group>
      <Form.Label>Permissions</Form.Label>
      {PERMISSIONS_MODULES.map((module) => (
        <div key={module} style={{ marginBottom: '1rem' }}>
          <strong>{module.charAt(0).toUpperCase() + module.slice(1)}:</strong>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {ACTIONS.map((action) => (
              <Form.Check
                inline
                type="switch"
                id={`${module}-${action}`}
                key={action}
                label={action}
                checked={permissions[module]?.[action] || false}
                onChange={(e) => {
                  setValue('permissions', {
                    ...permissions,
                    [module]: {
                      ...permissions[module],
                      [action]: e.target.checked,
                    },
                  });
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <Form.Text className="text-danger">
        {typeof errors.permissions?.message === 'string'
          ? errors.permissions.message
          : typeof errors.permissions === 'string'
          ? errors.permissions
          : Object.keys(errors.permissions || {}).length > 0
          ? 'Select permission actions.'
          : ''}
      </Form.Text>
    </Form.Group>
  );
}


function renderDynamicArrayField<
  K extends 'diplomas_and_training' | 'specializations'
>(
  fieldName: K,
  items: string[],
  setValue: (name: K, value: string[]) => void,
  errors: any
) {
  return (
    <>
      {items?.map((value, idx) => (
        <Row key={idx} className="mb-2">
          <Col>
            <Form.Control
              value={value}
              onChange={(e) => {
                const newArr = [...items];
                newArr[idx] = e.target.value;
                setValue(fieldName, newArr);
              }}
              placeholder={
                fieldName === 'diplomas_and_training'
                  ? 'Diploma/Training'
                  : 'Specialization'
              }
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="danger"
              onClick={() => setValue(fieldName, items.filter((_, i) => i !== idx))}
              disabled={items.length === 1}
            >
              Remove
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        variant="outline-primary"
        onClick={() => setValue(fieldName, [...items, ''])}
        className="mb-2"
      >
        Add {fieldName === 'diplomas_and_training' ? 'Diploma/Training' : 'Specialization'}
      </Button>
      <Form.Text className="text-danger">
        {Array.isArray(errors[fieldName])
          ? errors[fieldName]
              ?.map((e: any) => e.message)
              .filter(Boolean)
              .join(', ')
          : errors[fieldName]?.message}
      </Form.Text>
    </>
  );
}

// Backend uses snake_case naming here
export interface AddTeamFormValues {
  last_name: string;
  first_name: string;
  full_name: string;
  job_1: string;
  specific_audience: string;
  specialization_1: string;
  job_2?: string;
  job_3?: string;
  job_4?: string;
  who_am_i: string;
  consultations: string;
  office_address: string;
  contact_email: string;
  contact_phone: string;
  schedule: Record<string, string>;
  about: string;
  languages_spoken: string[];
  payment_methods: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
  frequently_asked_questions: Record<string, string>;
  calendar_links: string[];
  photo: string;
  role: 'super_admin' | 'admin' | 'staff';
  status: 'active' | 'inactive';
  branches: number[];
  primary_branch_id: number;
  permissions: Record<string, any>;
  created_by_role: string;
}

const schema: yup.ObjectSchema<AddTeamFormValues> = yup.object({
  last_name: yup.string().required('Last name is required'),
  first_name: yup.string().required('First name is required'),
  full_name: yup.string().required(),
  job_1: yup.string().required('Primary job is required'),
  specific_audience: yup.string().required('Audience is required'),
  specialization_1: yup.string().required('Primary specialization is required'),
  job_2: yup.string().optional(),
  job_3: yup.string().optional(),
  job_4: yup.string().optional(),
  who_am_i: yup.string().required('Biography is required'),
  consultations: yup.string().required('Consultations are required'),
  office_address: yup.string().required('Office address is required'),
  contact_email: yup.string().email('Enter valid email').required('Email is required'),
  contact_phone: yup.string().required('Phone is required'),
  schedule: yup
    .object()
    .test(
      'schedule-days',
      'Please enter schedule for at least one day',
      (val) =>
        val &&
        typeof val === 'object' &&
        Object.values(val).some(
          (someValue) => typeof someValue === 'string' && someValue.trim() !== ''
        )
    )
    .required('Schedule is required'),
  about: yup.string().required('About is required'),
  languages_spoken: yup
    .array()
    .of(yup.string().required('Enter a language'))
    .min(1, 'Please select at least one language')
    .default([]),
  payment_methods: yup
    .array()
    .of(yup.string().required('Enter a payment method'))
    .min(1, 'Please select at least one payment method')
    .default([]),
  diplomas_and_training: yup
    .array()
    .of(yup.string().required('Enter diploma/training'))
    .min(1, 'Add at least one diploma/training')
    .default([]),
  specializations: yup
    .array()
    .of(yup.string().required('Enter specialization'))
    .min(1, 'Add at least one specialization')
    .default([]),
  website: yup.string().url('Enter a valid website URL').required('Website is required'),
  frequently_asked_questions: yup.object().required(),
  calendar_links: yup
    .array()
    .of(
      yup
        .string()
        .required('Enter a calendar link')
        .url('Enter a valid URL')
    )
    .min(1, 'Add at least one calendar link')
    .default([]),
  photo: yup.string().url('Enter a valid photo URL').required('Photo is required'),
  role: yup
    .mixed<'super_admin' | 'admin' | 'staff'>()
    .oneOf(['super_admin', 'admin', 'staff'])
    .required('Role is required'),
  status: yup
    .mixed<'active' | 'inactive'>()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  branches: yup
    .array()
    .of(yup.number().required())
    .min(1, 'Select at least one branch')
    .required()
    .default([]),
  primary_branch_id: yup.number().required('Select a primary branch'),
  permissions: yup.object().required(),
  created_by_role: yup.string().required('Creator role required'),
});

function toCreatePayload(values: AddTeamFormValues): any {
  const scheduleText = Object.entries(values.schedule)
  .filter(([_, v]) => typeof v === 'string' && v.trim() !== '')
  .map(([day, v]) => `${day}: ${v}`)
  .join('\n');


  return {
    team_id: '',
    last_name: values.last_name,
    first_name: values.first_name,
    full_name: values.full_name,
    job_1: values.job_1,
    specific_audience: values.specific_audience,
    specialization_1: values.specialization_1,
    job_2: values.job_2,
    job_3: values.job_3,
    job_4: values.job_4,
    who_am_i: values.who_am_i,
    consultations: values.consultations,
    office_address: values.office_address,
    contact_email: values.contact_email,
    contact_phone: values.contact_phone,
    schedule: { text: scheduleText || null },
    about: values.about,
    languages_spoken: values.languages_spoken,
    payment_methods: values.payment_methods,
    diplomas_and_training: values.diplomas_and_training,
    specializations: values.specializations,
    website: values.website,
    frequently_asked_questions:
      typeof values.frequently_asked_questions === 'string'
        ? JSON.parse(values.frequently_asked_questions)
        : values.frequently_asked_questions || {},
    calendar_links: values.calendar_links,
    photo: values.photo,
    role: values.role,
    status: values.status,
    branches: values.branches,
    primary_branch: values.primary_branch_id,
    permissions: values.permissions,
    created_by_role: values.created_by_role,
  };
}

function toUpdatePayload(values: AddTeamFormValues, source: any): any {
  const payload = toCreatePayload(values);
  const branchesAsNumbers: number[] | undefined = Array.isArray(payload.branches)
    ? payload.branches
        .map((b: any) => (typeof b === 'string' ? Number(b) : b))
        .filter((b: number): b is number => typeof b === 'number' && !isNaN(b))
    : undefined;
  return {
    ...payload,
    branches: branchesAsNumbers,
    selected_branch: values.primary_branch_id,
    permissions: Object.keys(values.permissions || {}).flatMap((module) =>
      Object.entries(values.permissions[module] || {}).map(([action, enabled]) => ({
        action,
        resource: module,
        enabled,
      }))
    ),
    created_by_role: source.role === 'super_admin' ? 'super_admin' : 'admin',
  };
}

const AddTeamPage: React.FC<AddTeamProps> = ({ defaultValues, isEdit }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = Boolean(id);

  const [faqs, setFaqs] = useState<Record<string, string>>({});
  const [loadedMember, setLoadedMember] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
   const { showNotification } = useNotificationContext();

  const {
    control,
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      last_name: '',
      first_name: '',
      full_name: '',
      job_1: '',
      specific_audience: '',
      specialization_1: '',
      job_2: '',
      job_3: '',
      job_4: '',
      who_am_i: '',
      consultations: '',
      office_address: '',
      contact_email: '',
      contact_phone: '',
      schedule: {},
      about: '',
      languages_spoken: [],
      payment_methods: [],
      diplomas_and_training: [''],
      specializations: [''],
      website: '',
      frequently_asked_questions: {},
      calendar_links: [],
      photo: '',
      role: 'staff',
      status: 'active',
      branches: [],
      primary_branch_id: BRANCHES[0].id,
      permissions: PERMISSIONS_MODULES.reduce(
        (acc, module) => ({ ...acc, [module]: {} }),
        {} as Record<string, any>
      ),
      permissions: PERMISSIONS_MODULES.reduce(
        (acc, module) => ({ ...acc, [module]: {} }),
        {} as Record<string, any>
      ),
      created_by_role: 'admin',
    },
  });

  const diplomas = watch('diplomas_and_training');
  const specializations = watch('specializations');
  const schedule = watch('schedule');
  const permissions = watch('permissions');

  useEffect(() => {
    if (!isEditMode || !id) {
      reset();
      setLoadedMember(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getTeamMemberById(id)
      .then((data) => {
        if (!data) {
          setLoadedMember(null);
          setLoading(false);
          return;
        }

        const allowedStatuses = ['active', 'inactive'] as const;
        const incomingStatus =
          typeof data.status === 'string' ? data.status.toLowerCase() : undefined;
        const safeStatus: 'active' | 'inactive' = allowedStatuses.includes(
          incomingStatus as any
        )
          ? (incomingStatus as 'active' | 'inactive')
        const allowedStatuses = ['active', 'inactive'] as const;
        const incomingStatus =
          typeof data.status === 'string' ? data.status.toLowerCase() : undefined;
        const safeStatus: 'active' | 'inactive' = allowedStatuses.includes(
          incomingStatus as any
        )
          ? (incomingStatus as 'active' | 'inactive')
          : 'active';

        const parsedPermissions =
          typeof data.permissions === 'string'
            ? JSON.parse(data.permissions)
            : data.permissions ?? {};

        const validRoles = ['super_admin', 'admin', 'staff'] as const;
        const roleFromData = typeof data.role === 'string' ? data.role : undefined;
        const safeRole = validRoles.includes(roleFromData as any)
          ? (roleFromData as 'super_admin' | 'admin' | 'staff')
          : 'staff';

        reset({
          last_name: data.last_name ?? '',
          first_name: data.first_name ?? '',
          full_name: data.full_name ?? '',
          job_1: data.job_1 ?? '',
          specific_audience: data.specific_audience ?? '',
          specialization_1: data.specialization_1 ?? '',
          job_2: data.job_2 ?? '',
          job_3: data.job_3 ?? '',
          job_4: data.job_4 ?? '',
          who_am_i: data.who_am_i ?? '',
          consultations: data.consultations ?? '',
          office_address: data.office_address ?? '',
          contact_email: data.contact_email ?? '',
          contact_phone: data.contact_phone ?? '',
          schedule:
            data.schedule && typeof data.schedule.text === 'string'
              ? Object.fromEntries(
                  (data.schedule.text ?? '')
                    .split('\n')
                    .map((line) => {
                      const [day, ...rest] = line.split(':');
                      return [day.trim().toLowerCase(), rest.join(':').trim()];
                    })
                    .filter(([day, value]) => day && value)
                )
              : {},
          about: data.about ?? '',
          languages_spoken: data.languages_spoken ?? [],
          payment_methods: data.payment_methods ?? [],
          diplomas_and_training: Array.isArray(data.diplomas_and_training)
            ? data.diplomas_and_training
            : [''],
          specializations: Array.isArray(data.specializations)
            ? data.specializations
            : [''],
          website: data.website ?? '',
          frequently_asked_questions:
            typeof data.frequently_asked_questions === 'object' &&
            data.frequently_asked_questions !== null
              ? data.frequently_asked_questions
              : {},
          calendar_links: Array.isArray(data.calendar_links) ? data.calendar_links : [],
          photo: data.photo ?? '',
          role: safeRole,
          status: safeStatus,
          branches: Array.isArray(data.branch_ids)
            ? data.branch_ids.map((b: any) => (typeof b === 'string' ? Number(b) : b))
            : [],
          primary_branch_id:
            typeof data.primary_branch_id === 'number'
              ? data.primary_branch_id
              : BRANCHES[0].id,
          permissions: parsedPermissions,
          created_by_role: data.created_by_role ?? 'admin',
        });
        setFaqs(
          typeof data.frequently_asked_questions === 'string'
            ? JSON.parse(data.frequently_asked_questions)
            : data.frequently_asked_questions ?? {}
        );
        setLoadedMember(data);
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode, reset]);

  useEffect(() => {
    setValue('frequently_asked_questions', faqs);
  }, [faqs, setValue]);

  useEffect(() => {
    const firstName =
      typeof watch('first_name') === 'string' ? watch('first_name').trim() : '';
    const lastName =
      typeof watch('last_name') === 'string' ? watch('last_name').trim() : '';
    setValue('full_name', `${firstName} ${lastName}`.trim());
  }, [watch('first_name'), watch('last_name'), setValue]);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    let success = false;

    function isValidUUID(uuid: string): boolean {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    }


    if (isEditMode && id && loadedMember) {
      const payload = toUpdatePayload(formData, loadedMember);

      const safeUpdatePayload = {
        ...payload,
        team_id: isValidUUID(payload.team_id) ? payload.team_id : null,
        primary_branch: isValidUUID(String(payload.primary_branch)) ? payload.primary_branch : null,
        selected_branch: isValidUUID(String(payload.selected_branch)) ? payload.selected_branch : null,
        branches:
          payload.branches?.map((b: any) => (typeof b === 'string' ? Number(b) : b)) || [],
      };
      console.log('Update payload:', safeUpdatePayload);
      console.log('Sanitized payload before sending:', safeUpdatePayload);
      success = await updateTeamMember(id, safeUpdatePayload);
      const payload = toUpdatePayload(formData, loadedMember);

      const safeUpdatePayload = {
        ...payload,
        team_id: isValidUUID(payload.team_id) ? payload.team_id : null,
        primary_branch: isValidUUID(String(payload.primary_branch)) ? payload.primary_branch : null,
        selected_branch: isValidUUID(String(payload.selected_branch)) ? payload.selected_branch : null,
        branches:
          payload.branches?.map((b: any) => (typeof b === 'string' ? Number(b) : b)) || [],
      };
      console.log('Update payload:', safeUpdatePayload);
      console.log('Sanitized payload before sending:', safeUpdatePayload);
      success = await updateTeamMember(id, safeUpdatePayload);
    } else {
      const payload = toCreatePayload(formData);
      console.log('Create payload:', payload);
      const payload = toCreatePayload(formData);
      console.log('Create payload:', payload);
      success = await createTeamMember(payload);
    }


    setLoading(false);
    if (success) {
      showNotification({ message: 'Team Member Added Successfully', variant: 'success' });
      router.push('/teams/teams-list');
    } else {
      showNotification({ message: 'Something Went Wrong', variant: 'danger' });
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
          <CardTitle as="h4">{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Personal & Job Details */}
          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control {...register('first_name')} isInvalid={!!errors.first_name} />
                <Form.Control.Feedback type="invalid">{typeof errors.first_name?.message === 'string' ? errors.first_name.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control {...register('last_name')} isInvalid={!!errors.last_name} />
                <Form.Control.Feedback type="invalid">{typeof errors.last_name?.message === 'string' ? errors.last_name.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control {...register('full_name')} disabled />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Primary Job</Form.Label>
                <Form.Control {...register('job_1')} isInvalid={!!errors.job_1} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_1?.message === 'string' ? errors.job_1.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Audience</Form.Label>
                <Form.Control {...register('specific_audience')} isInvalid={!!errors.specific_audience} />
                <Form.Control.Feedback type="invalid">{typeof errors.specific_audience?.message === 'string' ? errors.specific_audience.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Primary Specialization</Form.Label>
                <Form.Control {...register('specialization_1')} isInvalid={!!errors.specialization_1} />
                <Form.Control.Feedback type="invalid">{typeof errors.specialization_1?.message === 'string' ? errors.specialization_1.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Job 2</Form.Label>
                <Form.Control {...register('job_2')} isInvalid={!!errors.job_2} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_2?.message === 'string' ? errors.job_2?.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Job 3</Form.Label>
                <Form.Control {...register('job_3')} isInvalid={!!errors.job_3} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_3?.message === 'string' ? errors.job_3?.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Job 4</Form.Label>
                <Form.Control {...register('job_4')} isInvalid={!!errors.job_4} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_4?.message === 'string' ? errors.job_4.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control {...register('first_name')} isInvalid={!!errors.first_name} />
                <Form.Control.Feedback type="invalid">{typeof errors.first_name?.message === 'string' ? errors.first_name.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control {...register('last_name')} isInvalid={!!errors.last_name} />
                <Form.Control.Feedback type="invalid">{typeof errors.last_name?.message === 'string' ? errors.last_name.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control {...register('full_name')} disabled />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Primary Job</Form.Label>
                <Form.Control {...register('job_1')} isInvalid={!!errors.job_1} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_1?.message === 'string' ? errors.job_1.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Audience</Form.Label>
                <Form.Control {...register('specific_audience')} isInvalid={!!errors.specific_audience} />
                <Form.Control.Feedback type="invalid">{typeof errors.specific_audience?.message === 'string' ? errors.specific_audience.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Primary Specialization</Form.Label>
                <Form.Control {...register('specialization_1')} isInvalid={!!errors.specialization_1} />
                <Form.Control.Feedback type="invalid">{typeof errors.specialization_1?.message === 'string' ? errors.specialization_1.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Job 2</Form.Label>
                <Form.Control {...register('job_2')} isInvalid={!!errors.job_2} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_2?.message === 'string' ? errors.job_2?.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Job 3</Form.Label>
                <Form.Control {...register('job_3')} isInvalid={!!errors.job_3} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_3?.message === 'string' ? errors.job_3?.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Job 4</Form.Label>
                <Form.Control {...register('job_4')} isInvalid={!!errors.job_4} />
                <Form.Control.Feedback type="invalid">{typeof errors.job_4?.message === 'string' ? errors.job_4.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Contact & Office Info */}
          <Row>
            <Col md={6} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control {...register('contact_email')} isInvalid={!!errors.contact_email} />
                <Form.Control.Feedback type="invalid">{typeof errors.contact_email?.message === 'string' ? errors.contact_email.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control {...register('contact_phone')} isInvalid={!!errors.contact_phone} />
                <Form.Control.Feedback type="invalid">{typeof errors.contact_phone?.message === 'string' ? errors.contact_phone.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Office Address</Form.Label>
                <Form.Control {...register('office_address')} isInvalid={!!errors.office_address} />
                <Form.Control.Feedback type="invalid">{typeof errors.office_address?.message === 'string' ? errors.office_address.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control {...register('contact_email')} isInvalid={!!errors.contact_email} />
                <Form.Control.Feedback type="invalid">{typeof errors.contact_email?.message === 'string' ? errors.contact_email.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control {...register('contact_phone')} isInvalid={!!errors.contact_phone} />
                <Form.Control.Feedback type="invalid">{typeof errors.contact_phone?.message === 'string' ? errors.contact_phone.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Office Address</Form.Label>
                <Form.Control {...register('office_address')} isInvalid={!!errors.office_address} />
                <Form.Control.Feedback type="invalid">{typeof errors.office_address?.message === 'string' ? errors.office_address.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* About, Consultations, Biography */}
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>About</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('about')} isInvalid={!!errors.about} />
                <Form.Control.Feedback type="invalid">{typeof errors.about?.message === 'string' ? errors.about.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Consultations</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('consultations')} isInvalid={!!errors.consultations} />
                <Form.Control.Feedback type="invalid">{typeof errors.consultations?.message === 'string' ? errors.consultations.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Biography</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('who_am_i')} isInvalid={!!errors.who_am_i} />
                <Form.Control.Feedback type="invalid">{typeof errors.who_am_i?.message === 'string' ? errors.who_am_i.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>About</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('about')} isInvalid={!!errors.about} />
                <Form.Control.Feedback type="invalid">{typeof errors.about?.message === 'string' ? errors.about.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Consultations</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('consultations')} isInvalid={!!errors.consultations} />
                <Form.Control.Feedback type="invalid">{typeof errors.consultations?.message === 'string' ? errors.consultations.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Biography</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('who_am_i')} isInvalid={!!errors.who_am_i} />
                <Form.Control.Feedback type="invalid">{typeof errors.who_am_i?.message === 'string' ? errors.who_am_i.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Schedule */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">Schedule</CardTitle>
            </CardHeader>
            <CardHeader>
              <CardTitle as="h6">Schedule</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                {SCHEDULE_DAYS.map((day) => (
                {SCHEDULE_DAYS.map((day) => (
                  <Col md={6} key={day} className="mb-3">
                    <Form.Group>
                      <Form.Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Form.Label>
                      <Form.Control
                        value={schedule[day] || ''}
                        onChange={(e) => setValue('schedule', { ...schedule, [day]: e.target.value })}
                        onChange={(e) => setValue('schedule', { ...schedule, [day]: e.target.value })}
                        placeholder="e.g. 9am-5pm"
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
              <Form.Text className="text-danger">{typeof errors.schedule?.message === 'string' ? errors.schedule?.message : ''}</Form.Text>
            </CardBody>
          </Card>

          {/* Arrays */}
          <Row className="mb-3 align-items-center">
            <div style={{ display: 'flex', gap: '25rem', alignItems: 'center' }}>
              <Col md="auto">
                <Form.Group>
                  <Form.Label>Languages Spoken</Form.Label>
                  <div style={{ display: 'flex', gap: '5rem' }}>
                    {LANGUAGES.map((lang) => (
                      <Form.Check
                        key={lang}
                        type="checkbox"
                        label={lang}
                        checked={watch('languages_spoken').includes(lang)}
                        onChange={(e) => {
                          const current = watch('languages_spoken');
                          if (e.target.checked) {
                            setValue('languages_spoken', [...current, lang]);
                          } else {
                            setValue('languages_spoken', current.filter((l: string) => l !== lang));
                          }
                        }}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-danger">{typeof errors.languages_spoken?.message === 'string'
                    ? errors.languages_spoken.message
                    : ''}</Form.Text>
                </Form.Group>
              </Col>
              <Col md="auto">
                <Form.Group>
                  <Form.Label>Payment Methods</Form.Label>
                  <div style={{ display: 'flex', gap: '5rem' }}>
                    {PAYMENT_METHODS.map((pm) => (
                      <Form.Check
                        key={pm}
                        type="checkbox"
                        label={pm}
                        checked={watch('payment_methods').includes(pm)}
                        onChange={(e) => {
                          const current = watch('payment_methods');
                          if (e.target.checked) {
                            setValue('payment_methods', [...current, pm]);
                          } else {
                            setValue('payment_methods', current.filter((p: string) => p !== pm));
                          }
                        }}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-danger">{typeof errors.payment_methods?.message === 'string'
                      ? errors.payment_methods.message
                      : ''}</Form.Text>
                </Form.Group>
              </Col>
            </div>
            </Row>


          {/* Dynamic text arrays for diplomas and specializations */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Diplomas & Training</Form.Label>
                {renderDynamicArrayField('diplomas_and_training', diplomas, setValue, errors)}
              <Form.Group>
                <Form.Label>Diplomas & Training</Form.Label>
                {renderDynamicArrayField('diplomas_and_training', diplomas, setValue, errors)}
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Specializations</Form.Label>
                {renderDynamicArrayField('specializations', specializations, setValue, errors)}
              <Form.Group>
                <Form.Label>Specializations</Form.Label>
                {renderDynamicArrayField('specializations', specializations, setValue, errors)}
              </Form.Group>
            </Col>
          </Row>

          {/* Calendar Links and Branches */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Calendar Links (comma separated URLs)</Form.Label>
                <Controller
                  control={control}
                  name="calendar_links"
                  render={({ field }) => (
                    <Form.Control
                      value={field.value.join(',')}
                      onChange={(e) => field.onChange(e.target.value.split(',').map((v) => v.trim()).filter(Boolean))}
                      onChange={(e) => field.onChange(e.target.value.split(',').map((v) => v.trim()).filter(Boolean))}
                    />
                  )}
                />
                <Form.Text className="text-danger">{typeof errors.calendar_links?.message === 'string' ? errors.calendar_links.message : ''}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Branches</Form.Label>
                <div style={{ display: 'flex', gap: '5rem', flexWrap: 'wrap' }}>
                  {BRANCHES.map((branch) => (
                    <Form.Check
                      key={branch.id}
                      type="checkbox"
                      label={branch.name}
                      checked={watch('branches').includes(branch.id)}
                      onChange={(e) => {
                        const current = watch('branches');
                        if (e.target.checked) {
                          setValue('branches', [...current, branch.id]);
                        } else {
                          setValue('branches', current.filter((b: number) => b !== branch.id));
                        }
                      }}
                    />
                  ))}
                </div>
                <Form.Text className="text-danger">{typeof errors.branches?.message === 'string' ? errors.branches.message : ''}</Form.Text>
              </Form.Group>

            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Primary Branch</Form.Label>
                <Controller
                  control={control}
                  name="primary_branch_id"
                  render={({ field }) => (
                    <Form.Control as="select" className="form-select" {...field}>
                      {BRANCHES.map((br) => (
                        <option key={br.id} value={br.id}>
                          {br.name}
                        </option>
                      {BRANCHES.map((br) => (
                        <option key={br.id} value={br.id}>
                          {br.name}
                        </option>
                      ))}
                    </Form.Control>
                  )}
                />
                <Form.Text className="text-danger">{typeof errors.primary_branch_id?.message === 'string' ? errors.primary_branch_id.message : ''}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {/* Permissions */}
          <Row>
            <Col md={12}>{renderPermissions(permissions, setValue, errors)}</Col>
          </Row>
          {/* Created By Role and other fields */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Created By Role</Form.Label>
                <Form.Control {...register('created_by_role')} isInvalid={!!errors.created_by_role} />
                <Form.Control.Feedback type="invalid">{typeof errors.created_by_role?.message === 'string' ? errors.created_by_role.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Website URL</Form.Label>
                <Form.Control {...register('website')} isInvalid={!!errors.website} />
                <Form.Control.Feedback type="invalid">{typeof errors.website?.message === 'string' ? errors.website.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Photo URL</Form.Label>
                <Form.Control {...register('photo')} isInvalid={!!errors.photo} />
                <Form.Control.Feedback type="invalid">{typeof errors.photo?.message === 'string' ? errors.photo.message : ''}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* FAQ */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardHeader>
              <CardTitle as="h6">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardBody>
              {Object.entries(faqs).map(([question, answer], idx) => (
                <Row key={idx} className="mb-2">
                  <Col lg={5}>
                    <Form.Control
                      className="form-control"
                      value={question}
                      onChange={(e) => {
                      onChange={(e) => {
                        const newKey = e.target.value;
                        setFaqs((prev) => {
                        setFaqs((prev) => {
                          const updated = { ...prev };
                          delete updated[question];
                          updated[newKey] = answer;
                          return updated;
                        });
                      }}
                      placeholder="Question"
                    />
                  </Col>
                  <Col lg={5}>
                    <Form.Control
                      className="form-control"
                      value={answer}
                      onChange={(e) => {
                        setFaqs((prev) => ({ ...prev, [question]: e.target.value }));
                      onChange={(e) => {
                        setFaqs((prev) => ({ ...prev, [question]: e.target.value }));
                      }}
                      placeholder="Answer"
                    />
                  </Col>
                  <Col lg={2} xs="auto">
                    <Button
                      variant="outline-danger"
                      onClick={() =>
                        setFaqs((prev) => {
                        setFaqs((prev) => {
                          const updated = { ...prev };
                          delete updated[question];
                          return updated;
                        })
                      }
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-primary"
                onClick={() =>
                  setFaqs((prev) => ({ ...prev, [`Question ${Object.keys(prev).length + 1}`]: '' }))
                  setFaqs((prev) => ({ ...prev, [`Question ${Object.keys(prev).length + 1}`]: '' }))
                }
                className="mt-2"
              >
                Add FAQ
              </Button>
              <Form.Text className="text-danger">
                {typeof errors.frequently_asked_questions?.message === 'string'
                {typeof errors.frequently_asked_questions?.message === 'string'
                  ? errors.frequently_asked_questions.message
                  : ''}
                  : ''}
              </Form.Text>
            </CardBody>
          </Card>

          {/* Role and Status */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Form.Control as="select" className="form-select" {...field}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </Form.Control>
                  )}
                />
                <Form.Text className="text-danger">{typeof errors.role?.message === 'string' ? errors.role.message : ''}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Form.Control as="select" className="form-select" {...field}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Control>
                  )}
                />
                <Form.Text className="text-danger">{typeof errors.status?.message === 'string'
                  ? errors.status.message: ''}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Row className="justify-content-end">
        <Col xs={12} md={3}>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-100 mb-3">
            Submit
          </Button>
          {isSubmitting && <Spinner animation="border" variant="primary" className="ms-2" />}
        </Col>
      </Row>
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger mt-3">
          <ul>
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                {Array.isArray(v)
                  ? v.map((e: any) => e.message).filter(Boolean).join(', ')
                  : (v as any)?.message}
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                {Array.isArray(v)
                  ? v.map((e: any) => e.message).filter(Boolean).join(', ')
                  : (v as any)?.message}
              </li>
            ))}
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export default AddTeamPage;
