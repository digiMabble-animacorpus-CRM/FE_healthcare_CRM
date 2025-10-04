'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useNotificationContext } from '@/context/useNotificationContext';
import { createTeamMember, getTeamMemberById, updateTeamMember } from '@/helpers/team-members';

export interface AddTeamProps {
  teamMemberId?: string;
  isEdit?: boolean;
}

const PERMISSIONS_MODULES = ['Rendez-vous', 'patients', 'équipes'];
const ACTIONS = ['view', 'create', 'edit', 'delete'];
const SCHEDULE_DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const LANGUAGES = ['Anglais', 'Français', 'Néerlandais'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Bank Transfer'];
const BRANCHES = [
  { id: 1, name: 'Gembloux - Orneau' },
  { id: 2, name: 'Gembloux - Tout Vent' },
  { id: 5, name: 'Namur' },
];

function renderPermissions(
  permissions: Record<string, Record<string, boolean>>,
  setValue: (name: 'permissions', value: Record<string, Record<string, boolean>>) => void,
  errors: any,
) {
  return (
    <Form.Group>
      <Form.Label>Autorisations</Form.Label>
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
              ? 'Sélectionnez les actions d autorisation.'
              : ''}
      </Form.Text>
    </Form.Group>
  );
}

function renderDynamicArrayField<K extends 'diplomas_and_training' | 'specializations'>(
  fieldName: K,
  items: string[],
  setValue: (name: K, value: string[]) => void,
  errors: any,
) {
  return (
    <>
      {items?.map((value, idx) => (
        <Row key={idx} className="m-2">
          <Col>
            <Form.Control
              value={value}
              onChange={(e) => {
                const newArr = [...items];
                newArr[idx] = e.target.value;
                setValue(fieldName, newArr);
              }}
              placeholder={
                fieldName === 'diplomas_and_training' ? 'Diploma/Training' : 'Specialization'
              }
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="danger"
              onClick={() =>
                setValue(
                  fieldName,
                  items.filter((_, i) => i !== idx),
                )
              }
              disabled={items.length === 1}
            >
              Retirer
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        variant="outline-primary"
        onClick={() => setValue(fieldName, [...items, ''])}
        className="m-2"
      >
        Ajouter {fieldName === 'diplomas_and_training' ? 'Diplôme/Formation' : 'Spécialisation'}
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

interface TeamMemberFormInputs {
  last_name?: string;
  first_name?: string;
  full_name?: string;
  job_1?: string;
  specific_audience?: string;
  specialization_1?: string;
  job_2?: string | null;
  job_3?: string | null;
  job_4?: string | null;
  who_am_i?: string;
  consultations?: string;
  office_address?: string;
  contact_email?: string;
  contact_phone?: string;
  schedule?: Record<string, string>; // e.g., { monday: "9-5", tuesday: "" }
  about?: string;
  languages_spoken?: any; // ⬅ string array for languages
  payment_methods?: any; // ⬅ string array for payment methods
  diplomas_and_training?: any; // ⬅ string array for diplomas/training
  specializations?: any; // ⬅ string array for specializations
  website?: string;
  frequently_asked_questions?: Record<string, string>; // ⬅ key-value pairs of Q&A
  calendar_links?: any; // ⬅ string array for calendar URLs
  photo?: string;
  role?: 'super_admin' | 'admin' | 'staff';
  status?: 'active' | 'inactive';
  branches?: number[]; // ⬅ branch IDs
  primary_branch_id?: number;
  permissions?: Record<string, string[]>; // ⬅ e.g., { module: ['read','write'] }
  created_by_role?: string;
}

const schema: yup.ObjectSchema<TeamMemberFormInputs> = yup.object({
  last_name: yup.string().required('Le nom de famille est obligatoire'),
  first_name: yup.string().required('Le prénom est obligatoire'),
  full_name: yup.string().required(),
  job_1: yup.string().optional(),
  specific_audience: yup.string().optional(),
  specialization_1: yup.string().optional(),
  job_2: yup.string().optional(),
  job_3: yup.string().optional(),
  job_4: yup.string().optional(),
  who_am_i: yup.string().optional(),
  consultations: yup.string().optional(),
  office_address: yup.string().optional(),
  contact_email: yup
    .string()
    .email('Entrez une adresse e-mail valide')
    .required('L adresse e-mail est obligatoire'),
  contact_phone: yup.string().optional(),
  schedule: yup.object().optional(),
  about: yup.string().optional(),
  languages_spoken: yup.array().of(yup.string()).optional(),
  payment_methods: yup.array().of(yup.string()).default([]),
  diplomas_and_training: yup.array().of(yup.string()).default([]),
  specializations: yup.array().of(yup.string()).default([]),
  website: yup.string().optional(),
  frequently_asked_questions: yup.object().optional(),
  calendar_links: yup.array().of(yup.string()).default([]),
  photo: yup.string().optional(),
  role: yup
    .mixed<'super_admin' | 'admin' | 'staff'>()
    .oneOf(['super_admin', 'admin', 'staff'])
    .optional(),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).optional(),
  branches: yup
    .array()
    .of(yup.number().required())
    .min(1, 'Sélectionnez au moins une branche')
    .required()
    .default([]),
  primary_branch_id: yup.number().optional(),
  permissions: yup.object().optional(),
  created_by_role: yup.string().optional(),
});

function trimValue(v: any) {
  return typeof v === 'string' ? v.trim() : v;
}

function toCreatePayload(values: any): any {
  const scheduleText = Object.entries(values.schedule || {})
    .filter(([_, v]) => typeof v === 'string' && v.trim() !== '')
    .map(([day, v]) => `${day}: ${(v as string).trim()}`)
    .join('\n');

  // --- Normalize languages and payments for payload ---
  const normalizedLanguages =
    Array.isArray(values.languages_spoken) &&
    values.languages_spoken.map((l: string) => l.split('(')[0].trim());

  const normalizedPayments =
    Array.isArray(values.payment_methods) &&
    values.payment_methods.map((p: string) => p.replace(/\r\n/g, '').trim());

  return {
    team_id: '',
    last_name: trimValue(values.last_name),
    first_name: trimValue(values.first_name),
    full_name: trimValue(values.full_name),
    job_1: trimValue(values.job_1),
    specific_audience: trimValue(values.specific_audience),
    specialization_1: trimValue(values.specialization_1),
    job_2: trimValue(values.job_2),
    job_3: trimValue(values.job_3),
    job_4: trimValue(values.job_4),
    who_am_i: trimValue(values.who_am_i),
    consultations: trimValue(values.consultations),
    office_address: trimValue(values.office_address),
    contact_email: trimValue(values.contact_email),
    contact_phone: trimValue(values.contact_phone),
    schedule: { text: scheduleText || null },
    about: trimValue(values.about),
    languages_spoken: normalizedLanguages || [],
    payment_methods: normalizedPayments || [],
    diplomas_and_training: values.diplomas_and_training.map(trimValue),
    specializations: values.specializations.map(trimValue),
    website: trimValue(values.website),
    frequently_asked_questions:
      typeof values.frequently_asked_questions === 'string'
        ? JSON.parse(values.frequently_asked_questions)
        : values.frequently_asked_questions || {},
    calendar_links: values.calendar_links.map(trimValue),
    photo: trimValue(values.photo),
    role: values.role,
    status: values.status,
    branches: values.branches,
    primary_branch: values.primary_branch_id,
    permissions: values.permissions,
    created_by_role: trimValue(values.created_by_role),
  };
}

function toUpdatePayload(values: any, source: any): any {
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
    permissions: values.permissions,
    created_by_role: source.role === 'super_admin' ? 'super_admin' : 'admin',
  };
}

function safeJsonParse<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

const AddTeamPage: React.FC<AddTeamProps> = ({ teamMemberId, isEdit }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = teamMemberId ?? searchParams.get('id');
  const isEditMode = isEdit ?? Boolean(id);

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
        {} as Record<string, any>,
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
      reset(); // clear form on add mode
      setLoadedMember(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    getTeamMemberById(id)
      .then((data) => {
        if (!data) {
          setLoadedMember(null);
          return;
        }

        const allowedStatuses = ['active', 'inactive'] as const;
        const incomingStatus =
          typeof data.status === 'string' ? data.status.toLowerCase() : undefined;
        const safeStatus: 'active' | 'inactive' = allowedStatuses.includes(incomingStatus as any)
          ? (incomingStatus as 'active' | 'inactive')
          : 'active';

        const parsedPermissions =
          typeof data.permissions === 'string'
            ? safeJsonParse(data.permissions, {})
            : (data.permissions ?? {});

        const validRoles = ['super_admin', 'admin', 'staff'] as const;
        const roleFromData = typeof data.role === 'string' ? data.role : undefined;
        const safeRole = validRoles.includes(roleFromData as any)
          ? (roleFromData as 'super_admin' | 'admin' | 'staff')
          : 'staff';

        // --- Normalize languages and payments ---
        const normalizedLanguages =
          Array.isArray(data.languages_spoken) &&
          data.languages_spoken.map((l: string) => l.split('(')[0].trim());
        const normalizedPayments =
          Array.isArray(data.payment_methods) &&
          data.payment_methods.map((p: string) => p.replace(/\r\n/g, '').trim());

        // --- Normalize branch IDs ---
        const branchIds =
          Array.isArray(data.branches) && data.branches.length > 0
            ? data.branches.map((b: any) => Number(b.branch_id))
            : [];

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
                    .filter(([day, value]) => day && value),
                )
              : {},
          about: data.about ?? '',
          languages_spoken: normalizedLanguages || [],
          payment_methods: normalizedPayments || [],
          diplomas_and_training: Array.isArray(data.diplomas_and_training)
            ? data.diplomas_and_training
            : [''],
          specializations: Array.isArray(data.specializations) ? data.specializations : [''],
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
          branches: branchIds,
          primary_branch_id:
            typeof data.primary_branch_id === 'number' ? data.primary_branch_id : BRANCHES[0].id,
          permissions: parsedPermissions,
          created_by_role: data.created_by_role ?? 'admin',
        });

        setFaqs(
          typeof data.frequently_asked_questions === 'string'
            ? safeJsonParse(data.frequently_asked_questions, {})
            : (data.frequently_asked_questions ?? {}),
        );
        setLoadedMember(data);
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode, reset]);

  useEffect(() => {
    setValue('frequently_asked_questions', faqs);
  }, [faqs, setValue]);

  useEffect(() => {
    const firstName = typeof watch('first_name') === 'string' ? watch('first_name').trim() : '';
    const lastName = typeof watch('last_name') === 'string' ? watch('last_name').trim() : '';
    setValue('full_name', `${firstName} ${lastName}`.trim());
  }, [watch('first_name'), watch('last_name'), setValue]);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    let success = false;

    function isValidUUID(uuid: string): boolean {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    }

    if (isEditMode && id && loadedMember) {
      const payload = toUpdatePayload(formData, loadedMember);

      const safeUpdatePayload = {
        ...payload,
        team_id: isValidUUID(payload.team_id) ? payload.team_id : null,
        primary_branch: isValidUUID(String(payload.primary_branch)) ? payload.primary_branch : null,
        selected_branch: isValidUUID(String(payload.selected_branch))
          ? payload.selected_branch
          : null,
        branches: payload.branches?.map((b: any) => (typeof b === 'string' ? Number(b) : b)) || [],
      };
      success = await updateTeamMember(id, safeUpdatePayload);
    } else {
      const payload = toCreatePayload(formData);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">
            {isEditMode ? 'Modifier un membre de l équipe' : 'Ajouter un membre de l équipe'}
          </CardTitle>
        </CardHeader>
        <CardBody>
          {/* Personal & Job Details */}
          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Prénom</Form.Label>
                <Form.Control {...register('first_name')} isInvalid={!!errors.first_name} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.first_name?.message === 'string' ? errors.first_name.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Nom de famille</Form.Label>
                <Form.Control {...register('last_name')} isInvalid={!!errors.last_name} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.last_name?.message === 'string' ? errors.last_name.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Nom et prénom</Form.Label>
                <Form.Control {...register('full_name')} disabled />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Primary Job</Form.Label>
                <Form.Control {...register('job_1')} isInvalid={!!errors.job_1} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.job_1?.message === 'string' ? errors.job_1.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Audience</Form.Label>
                <Form.Control
                  {...register('specific_audience')}
                  isInvalid={!!errors.specific_audience}
                />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.specific_audience?.message === 'string'
                    ? errors.specific_audience.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Spécialisation primaire</Form.Label>
                <Form.Control
                  {...register('specialization_1')}
                  isInvalid={!!errors.specialization_1}
                />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.specialization_1?.message === 'string'
                    ? errors.specialization_1.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Spécialisation secondaire 2</Form.Label>
                <Form.Control {...register('job_2')} isInvalid={!!errors.job_2} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.job_2?.message === 'string' ? errors.job_2?.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Spécialisation secondaire 3</Form.Label>
                <Form.Control {...register('job_3')} isInvalid={!!errors.job_3} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.job_3?.message === 'string' ? errors.job_3?.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Spécialisation secondaire 4</Form.Label>
                <Form.Control {...register('job_4')} isInvalid={!!errors.job_4} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.job_4?.message === 'string' ? errors.job_4.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Contact & Office Info */}
          <Row>
            <Col md={6} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>E-mail</Form.Label>
                <Form.Control {...register('contact_email')} isInvalid={!!errors.contact_email} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.contact_email?.message === 'string'
                    ? errors.contact_email.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Téléphone</Form.Label>
                <Form.Control {...register('contact_phone')} isInvalid={!!errors.contact_phone} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.contact_phone?.message === 'string'
                    ? errors.contact_phone.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12} lg={4} className="mb-3">
              <Form.Group>
                <Form.Label>Adresse du bureau</Form.Label>
                <Form.Control {...register('office_address')} isInvalid={!!errors.office_address} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.office_address?.message === 'string'
                    ? errors.office_address.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* About, Consultations, Biography */}
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>À propos</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('about')}
                  isInvalid={!!errors.about}
                />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.about?.message === 'string' ? errors.about.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Consultations</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('consultations')}
                  isInvalid={!!errors.consultations}
                />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.consultations?.message === 'string'
                    ? errors.consultations.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Biographie</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('who_am_i')}
                  isInvalid={!!errors.who_am_i}
                />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.who_am_i?.message === 'string' ? errors.who_am_i.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Schedule */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">Calendrier</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                {SCHEDULE_DAYS.map((day) => (
                  <Col md={6} key={day} className="mb-3">
                    <Form.Group>
                      <Form.Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Form.Label>
                      <Form.Control
                        value={schedule[day] || ''}
                        onChange={(e) =>
                          setValue('schedule', { ...schedule, [day]: e.target.value })
                        }
                        placeholder="e.g. 9am - 5pm"
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
              <Form.Text className="text-danger">
                {typeof errors.schedule?.message === 'string' ? errors.schedule?.message : ''}
              </Form.Text>
            </CardBody>
          </Card>

          {/* Arrays */}
          <Row className="mb-3 align-items-center">
            <div style={{ display: 'flex', gap: '25rem', alignItems: 'center' }}>
              <Col md="auto">
                <Form.Group>
                  <Form.Label>Langues parlées</Form.Label>
                  <div style={{ display: 'flex', gap: '10px' }}>
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
                            setValue(
                              'languages_spoken',
                              current.filter((l: string) => l !== lang),
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-danger">
                    {typeof errors.languages_spoken?.message === 'string'
                      ? errors.languages_spoken.message
                      : ''}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md="auto">
                <Form.Group>
                  <Form.Label>Méthodes de paiement</Form.Label>
                  <div style={{ display: 'flex', gap: '10px' }}>
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
                            setValue(
                              'payment_methods',
                              current.filter((p: string) => p !== pm),
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-danger">
                    {typeof errors.payment_methods?.message === 'string'
                      ? errors.payment_methods.message
                      : ''}
                  </Form.Text>
                </Form.Group>
              </Col>
            </div>
          </Row>

          {/* Dynamic text arrays for diplomas and specializations */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Diplômes & Formation</Form.Label>
                {renderDynamicArrayField('diplomas_and_training', diplomas, setValue, errors)}
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Spécialisations</Form.Label>
                {renderDynamicArrayField('specializations', specializations, setValue, errors)}
              </Form.Group>
            </Col>
          </Row>

          {/* Calendar Links and Branches */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Liens du calendrier (URL séparées par des virgules)</Form.Label>
                <Controller
                  control={control}
                  name="calendar_links"
                  render={({ field }) => (
                    <Form.Control
                      value={field.value.join(',')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((v) => v.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  )}
                />
                <Form.Text className="text-danger">
                  {typeof errors.calendar_links?.message === 'string'
                    ? errors.calendar_links.message
                    : ''}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Succursales</Form.Label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                          setValue(
                            'branches',
                            current.filter((b: number) => b !== branch.id),
                          );
                        }
                      }}
                    />
                  ))}
                </div>
                <Form.Text className="text-danger">
                  {typeof errors.branches?.message === 'string' ? errors.branches.message : ''}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Branche principale</Form.Label>
                <Controller
                  control={control}
                  name="primary_branch_id"
                  render={({ field }) => (
                    <Form.Control as="select" className="form-select" {...field}>
                      {BRANCHES.map((br) => (
                        <option key={br.id} value={br.id}>
                          {br.name}
                        </option>
                      ))}
                    </Form.Control>
                  )}
                />
                <Form.Text className="text-danger">
                  {typeof errors.primary_branch_id?.message === 'string'
                    ? errors.primary_branch_id.message
                    : ''}
                </Form.Text>
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
                <Form.Label>Créé par rôle</Form.Label>
                <Form.Control
                  {...register('created_by_role')}
                  isInvalid={!!errors.created_by_role}
                />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.created_by_role?.message === 'string'
                    ? errors.created_by_role.message
                    : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>URL du site Web</Form.Label>
                <Form.Control {...register('website')} isInvalid={!!errors.website} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.website?.message === 'string' ? errors.website.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>URL des photos</Form.Label>
                <Form.Control {...register('photo')} isInvalid={!!errors.photo} />
                <Form.Control.Feedback type="invalid">
                  {typeof errors.photo?.message === 'string' ? errors.photo.message : ''}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* FAQ */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">Questions fréquemment posées</CardTitle>
            </CardHeader>
            <CardBody>
              {Object.entries(faqs).map(([question, answer], idx) => (
                <Row key={idx} className="mb-2">
                  <Col lg={5}>
                    <Form.Control
                      className="form-control"
                      value={question}
                      onChange={(e) => {
                        const newKey = e.target.value;
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
                      }}
                      placeholder="Answer"
                    />
                  </Col>
                  <Col lg={2} xs="auto">
                    <Button
                      variant="outline-danger"
                      onClick={() =>
                        setFaqs((prev) => {
                          const updated = { ...prev };
                          delete updated[question];
                          return updated;
                        })
                      }
                    >
                      Retirer
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-primary"
                onClick={() =>
                  setFaqs((prev) => ({ ...prev, [`Question ${Object.keys(prev).length + 1}`]: '' }))
                }
                className="mt-2"
              >
                Ajouter une FAQ
              </Button>
              <Form.Text className="text-danger">
                {typeof errors.frequently_asked_questions?.message === 'string'
                  ? errors.frequently_asked_questions.message
                  : ''}
              </Form.Text>
            </CardBody>
          </Card>

          {/* Role and Status */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Rôle</Form.Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Form.Control as="select" className="form-select" {...field}>
                      <option value="super_admin">Super administrateur</option>
                      <option value="admin">Administrateur</option>
                      <option value="staff">Personnel</option>
                    </Form.Control>
                  )}
                />
                <Form.Text className="text-danger">
                  {typeof errors.role?.message === 'string' ? errors.role.message : ''}
                </Form.Text>
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
                <Form.Text className="text-danger">
                  {typeof errors.status?.message === 'string' ? errors.status.message : ''}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-end">
            <Col xs={12} md={3}>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-100 mb-3"
              >
                Sauvegarder
              </Button>
              {isSubmitting && <Spinner animation="border" variant="primary" className="ms-2" />}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </form>
  );
};

export default AddTeamPage;
