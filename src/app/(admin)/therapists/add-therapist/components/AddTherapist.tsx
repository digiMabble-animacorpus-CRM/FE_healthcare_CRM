'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Row, Col, Button, Card, CardBody } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';
import { useRouter } from 'next/navigation';

type AddTherapistProps = {
  therapistId?: string;
};

interface Branch {
  branch_id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Specialization {
  specialization_id: number;
  specialization_type: string;
}

interface Language {
  id: number;
  name: string;
}

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface BranchWithAvailability {
  branch_id: number;
  branch_name: string;
  availability: Availability[];
}

interface TherapistFormInputs {
  firstName: string;
  lastName: string;
  fullName: string;
  photo?: string | null;
  contactEmail: string;
  contactPhone: string;
  inamiNumber: string;
  aboutMe?: string | null;
  degreesTraining?: string | null;
  departmentId: number | null;
  specializationIds?: number[];
  branches: BranchWithAvailability[];
  languages: number[]; // selected language IDs
  faq?: string | null;
  paymentMethods: string[];
}

const schema: yup.ObjectSchema<TherapistFormInputs> = yup.object({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  fullName: yup.string(),
  photo: yup.string().url('Must be a valid URL').nullable(),
  contactEmail: yup.string().email('Invalid email').required('Email is required'),
  contactPhone: yup
    .string()
    .matches(/^\+?[0-9]{7,15}$/, 'Invalid phone')
    .required('Phone number is required'),
  inamiNumber: yup.string().required('INAMI Number is required'),
  aboutMe: yup.string().nullable(),
  degreesTraining: yup.string().nullable(),
  departmentId: yup
    .number()
    .nullable()
    .typeError('Department is required')
    .required('Department is required'),
  specializationIds: yup
    .array()
    .of(yup.number().required())
    .min(1, 'At least one specialization is required'),
  branches: yup
    .array()
    .of(
      yup.object({
        branch_id: yup.number().required('Branch is required'),
        branch_name: yup.string().nullable().defined(),
        availability: yup
          .array()
          .of(
            yup.object({
              day: yup.string().required('Day is required'),
              startTime: yup.string().required('Start time is required'),
              endTime: yup.string().required('End time is required'),
            }),
          )
          .min(1, 'At least one availability slot is required')
          .required('Availability is required'),
      }),
    )
    .min(1, 'At least one branch is required')
    .required('Branches are required')
    .defined(),
  languages: yup.array().of(yup.number().required()).min(1, 'At least one language is required'),
  faq: yup.string().nullable(),
  paymentMethods: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one payment method is required'),
});

const AddTherapist: React.FC<AddTherapistProps> = ({ therapistId }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<TherapistFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      fullName: '',
      photo: '',
      contactEmail: '',
      contactPhone: '',
      inamiNumber: '',
      aboutMe: null,
      degreesTraining: null,
      departmentId: null,
      specializationIds: [],
      branches: [],
      languages: [],
      faq: null,
      paymentMethods: [],
    },
  });

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: 'branches',
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const router = useRouter();

  const departmentId = watch('departmentId');
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // Auto update fullName
  useEffect(() => {
    setValue('fullName', `${firstName || ''} ${lastName || ''}`.trim());
  }, [firstName, lastName, setValue]);

  const safeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  // --- Loader functions (they return the loaded array)
  const loadBranches = async (): Promise<Branch[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_PATH}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const arr = safeArray(json);
      setBranches(arr);
      return arr;
    } catch (err) {
      console.error('Error loading branches:', err);
      setBranches([]);
      return [];
    }
  };

  const loadDepartments = async (): Promise<Department[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_PATH}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const arr = safeArray(json);
      setDepartments(arr);
      return arr;
    } catch (err) {
      console.error('Error loading departments:', err);
      setDepartments([]);
      return [];
    }
  };

  const loadLanguages = async (): Promise<Language[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_PATH}/languages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const arr = safeArray(json);
      setLanguages(arr);
      return arr;
    } catch (err) {
      console.error('Error loading languages:', err);
      setLanguages([]);
      return [];
    }
  };

  // Specializations loader based on department
  useEffect(() => {
    if (!departmentId || !token) {
      setSpecializations([]);
      return;
    }
    const loadSpecializations = async () => {
      try {
        const res = await fetch(
          `${API_BASE_PATH}/specializations?departmentId=${departmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const json = await res.json();
        setSpecializations(safeArray(json));
      } catch (err) {
        console.error('Error loading specializations:', err);
        setSpecializations([]);
      }
    };
    loadSpecializations();
  }, [departmentId, token]);

  // --- Mapping helper: transform API therapist -> form shape
  // IMPORTANT: This mapper expects the API shape you posted:
  // languages: ["English", "French"]
  // branches: [1,2]
  // availability: [{day, startTime, endTime}, ...] (root array)
  const mapTherapistToFormValues = (
    data: any,
    branchesList: Branch[],
    languagesList: Language[],
  ): TherapistFormInputs => {
    if (!data) {
      return {
        firstName: '',
        lastName: '',
        fullName: '',
        photo: null,
        contactEmail: '',
        contactPhone: '',
        inamiNumber: '',
        aboutMe: null,
        degreesTraining: null,
        departmentId: null,
        specializationIds: [],
        branches: [],
        languages: [],
        faq: null,
        paymentMethods: [],
      };
    }

    // --- Specializations (IDs) — API provides array of numbers in your example
    const specializationIds: number[] = Array.isArray(data.specializations)
  ? data.specializations.map((s: any) =>
      typeof s === 'number' ? s : s.specialization_id || s.id
    )
  : [];


    // --- Availability root array (normalize keys)
    const rootAvailability: Availability[] = Array.isArray(data.availability)
      ? data.availability.map((av: any) => ({
          day: av.day ?? av.d ?? '',
          startTime: av.startTime ?? av.start_time ?? av.from ?? '',
          endTime: av.endTime ?? av.end_time ?? av.to ?? '',
        }))
      : [];

    
    const formBranches: BranchWithAvailability[] = Array.isArray(data.branches)
  ? data.branches.map((b: any) => {
      const branchId = b.branch_id ?? 0;
      const branchName = b.name ?? '';
          
          const availabilityForThisBranch = rootAvailability.length > 0 ? rootAvailability.map(a => ({ ...a })) : [{ day: '', startTime: '', endTime: '' }];

          return {
            branch_id: branchId,
        branch_name: branchName,
        availability: availabilityForThisBranch,
          };
        })
      : [];

    // --- Languages: API gives strings, match to languagesList to get IDs
    const langIds: number[] = Array.isArray(data.languages)
      ? data.languages
          .map((langNameOrObj: any) => {
            if (typeof langNameOrObj === 'number') return langNameOrObj;
            if (typeof langNameOrObj === 'object' && langNameOrObj !== null) {
              // sometimes API might return objects; accept language_id or id
              return langNameOrObj.language_id ?? langNameOrObj.id ?? undefined;
            }
            if (typeof langNameOrObj === 'string') {
              const found = languagesList.find(
                (l) => l.name?.toLowerCase() === langNameOrObj.toLowerCase(),
              );
              return found?.id;
            }
            return undefined;
          })
          .filter((id: any) => typeof id === 'number')
      : [];

    const resetObj: TherapistFormInputs = {
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      photo: data.photo ?? data.imageUrl ?? null,
      contactEmail: data.contactEmail ?? '',
      contactPhone: data.contactPhone ?? '',
      inamiNumber: data.inamiNumber != null ? String(data.inamiNumber) : '',
      aboutMe: data.aboutMe ?? null,
      degreesTraining: data.degreesTraining ?? null,
      departmentId: data.departmentId ?? null,
      specializationIds,
      branches: formBranches,
      languages: langIds,
      faq: data.faq ?? null,
      paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
    };

    // debug logs to help you verify mapping
    console.log('mapTherapistToFormValues -> rootAvailability:', rootAvailability);
    console.log('mapTherapistToFormValues -> formBranches:', formBranches);
    console.log('mapTherapistToFormValues -> langIds:', langIds);
    console.log('mapTherapistToFormValues -> resetObj:', resetObj);

    return resetObj;
  };

  // --- Combined init: load dropdowns (and use returned arrays) then fetch therapist and reset
  useEffect(() => {
    const init = async () => {
      if (!token) return;

      console.log('Starting to load branches/departments/languages...');
      try {
        const [branchesRes, departmentsRes, languagesRes] = await Promise.all([
          loadBranches(),
          loadDepartments(),
          loadLanguages(),
        ]);
        console.log('Loaded dropdowns:', { branchesRes, departmentsRes, languagesRes });

        setDropdownsLoaded(true);

        // If editing, fetch therapist and map using the freshly loaded dropdown arrays
        if (therapistId) {
          try {
            const resp = await axios.get(`${API_BASE_PATH}/therapists/${therapistId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = resp.data;
            console.log('Fetched therapist API data:', data);

            const mapped = mapTherapistToFormValues(data, branchesRes, languagesRes);
            console.log('Mapped therapist -> form values (before reset):', mapped);

            // Reset form with mapped object (this will populate field arrays)
            reset(mapped);
          } catch (err) {
            console.error('Failed to fetch therapist for edit:', err);
          }
        }
      } catch (err) {
        console.error('Init error loading dropdowns:', err);
      }
    };

    init();
    // Intentionally depend only on token & therapistId & reset
  }, [token, therapistId, reset]);

  // Debug watch of all form values
  useEffect(() => {
    const sub = watch((vals) => {
      console.log('Watched form values:', vals);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // Transform before submit: this sends availability with branchId attached per your transformPayload
  const transformPayload = (data: TherapistFormInputs) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    photo: data.photo,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    inamiNumber: Number(data.inamiNumber),
    aboutMe: data.aboutMe,
    degreesTraining: data.degreesTraining,
    departmentId: data.departmentId,
    specializations: data.specializationIds?.map((id) => id),
    branches: data.branches.map((b) => b.branch_id),
    availability: data.branches.flatMap((b) =>
      b.availability.map((av) => ({
        ...av,
        branchId: b.branch_id,
      })),
    ),
    languages: data.languages
      .map((id) => {
        const langObj = languages.find((l) => l.id === id);
        return langObj ? langObj.name : null;
      })
      .filter((n) => n),
    faq: data.faq,
    paymentMethods: data.paymentMethods,
  });

  const onSubmit = async (data: TherapistFormInputs) => {
    try {
      const payload = transformPayload(data);
      const url = therapistId ? `${API_BASE_PATH}/therapists/${therapistId}` : `${API_BASE_PATH}/therapists`;
      const method = therapistId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` || '',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Therapist ${therapistId ? 'updated' : 'saved'} successfully`);
        router.push('/therapists/therapists-list');
      } else {
        const errText = await res.text();
        throw new Error(`Unexpected status: ${res.status} - ${errText}`);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      alert(err.message || 'Error saving therapist');
    }
  };

  // Component for availability slots remains same (uses field arrays)
  const AvailabilitySlots = ({ nestIndex }: { nestIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `branches.${nestIndex}.availability`,
    });

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    return (
      <>
        {fields.map((field, k) => (
          <Row key={field.id} className="align-items-center">
            <Col md={4}>
              <Form.Group
                controlId={`branches.${nestIndex}.availability.${k}.day`}
                className="mb-3"
              >
                <Form.Label>Day</Form.Label>
                <Form.Select
                  {...register(
                    `branches.${nestIndex}.availability.${k}.day` as const,
                  )}
                  isInvalid={
                    !!errors.branches?.[nestIndex]?.availability?.[k]?.day
                  }
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {
                    errors.branches?.[nestIndex]?.availability?.[k]?.day
                      ?.message
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group
                controlId={`branches.${nestIndex}.availability.${k}.startTime`}
                className="mb-3"
              >
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  {...register(
                    `branches.${nestIndex}.availability.${k}.startTime` as const,
                  )}
                  isInvalid={
                    !!errors.branches?.[nestIndex]?.availability?.[k]
                      ?.startTime
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {
                    errors.branches?.[nestIndex]?.availability?.[k]
                      ?.startTime?.message
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group
                controlId={`branches.${nestIndex}.availability.${k}.endTime`}
                className="mb-3"
              >
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  {...register(
                    `branches.${nestIndex}.availability.${k}.endTime` as const,
                  )}
                  isInvalid={
                    !!errors.branches?.[nestIndex]?.availability?.[k]?.endTime
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {
                    errors.branches?.[nestIndex]?.availability?.[k]
                      ?.endTime?.message
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                type="button"
                variant="danger"
                onClick={() => remove(k)}
                style={{ marginTop: '1.7rem' }}
              >
                Remove
              </Button>
            </Col>
          </Row>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            append({ day: '', startTime: '', endTime: '' })
          }
        >
          Add Slot
        </Button>
      </>
    );
  };

  return (
    <Card className="p-3 shadow-sm rounded">
      <CardBody>
        <h5 className="mb-4">
          {therapistId ? 'Edit Therapist' : 'Add Therapist'}
        </h5>
        <Form
          onSubmit={handleSubmit(onSubmit, (errors) =>
            console.log('Validation errors:', errors),
          )}
        >
          {/* First name / Last name */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="firstName" className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('firstName')}
                  placeholder="Enter First Name"
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName" className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('lastName')}
                  placeholder="Enter Last Name"
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Full name, Photo */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="fullName" className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('fullName')}
                  placeholder="Full Name"
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="photo" className="mb-3">
                <Form.Label>Photo (URL)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Photo URL"
                  {...register('photo')}
                  isInvalid={!!errors.photo}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.photo?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Email, Phone */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="contactEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  {...register('contactEmail')}
                  placeholder="Enter Email"
                  isInvalid={!!errors.contactEmail}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactEmail?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="contactPhone" className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  {...register('contactPhone')}
                  placeholder="Enter Phone Number"
                  isInvalid={!!errors.contactPhone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPhone?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* INAMI Number, Degrees & Training */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="inamiNumber" className="mb-3">
                <Form.Label>INAMI Number</Form.Label>
                <Form.Control
                  type="text"
                  {...register('inamiNumber')}
                  placeholder="Enter INAMI Number"
                  isInvalid={!!errors.inamiNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.inamiNumber?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="degreesTraining" className="mb-3">
                <Form.Label>Degrees & Training</Form.Label>
                <Form.Control
                  as="textarea"
                  {...register('degreesTraining')}
                  placeholder="Enter Degrees & Training"
                  rows={3}
                  isInvalid={!!errors.degreesTraining}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.degreesTraining?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* About Me */}
          <Form.Group controlId="aboutMe" className="mb-3">
            <Form.Label>About Me</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register('aboutMe')}
              placeholder="Enter Description"
              isInvalid={!!errors.aboutMe}
            />
            <Form.Control.Feedback type="invalid">
              {errors.aboutMe?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Department + Specializations */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="departmentId" className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  {...register('departmentId')}
                  isInvalid={!!errors.departmentId}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departmentId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <div>
                  {specializations.map((s) => (
                    <Form.Check
                      inline
                      key={s.specialization_id}
                      type="checkbox"
                      label={s.specialization_type}
                      checked={
                        watch('specializationIds')?.includes(s.specialization_id)
                      }
                      onChange={(e) => {
                        const current = watch('specializationIds') || [];
                        if (e.target.checked) {
                          setValue('specializationIds', [
                            ...current,
                            s.specialization_id,
                          ]);
                        } else {
                          setValue(
                            'specializationIds',
                            current.filter((id: number) => id !== s.specialization_id),
                          );
                        }
                      }}
                    />
                  ))}
                </div>
                {errors.specializationIds && (
                  <Form.Text className="text-danger">
                    {errors.specializationIds.message as string}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Branch & Availability */}
          <h6>Branch & Availability</h6>
          {branchFields.map((branch, index) => (
            <Card key={branch.id} className="mb-3 p-3">
              <Row className="align-items-center">
                <Col md={8}>
                  <Form.Group
                    controlId={`branches.${index}.branch_id`}
                    className="mb-3"
                  >
                    <Form.Label>Branch</Form.Label>
                    <Form.Select
                      {...register(`branches.${index}.branch_id` as const)}
                      isInvalid={!!errors.branches?.[index]?.branch_id}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((b) => (
                        <option key={b.branch_id} value={b.branch_id}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.branches?.[index]?.branch_id?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Button
                    type="button"
                    variant="danger"
                    className="mt-4"
                    onClick={() => removeBranch(index)}
                  >
                    Remove Branch
                  </Button>
                </Col>
              </Row>
              <AvailabilitySlots nestIndex={index} />
            </Card>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              appendBranch({ branch_id: 0, branch_name: '', availability: [{ day: '', startTime: '', endTime: '' }] })
            }
            className="mb-3"
          >
            Add Branch
          </Button>

          {/* Languages + Payment Methods */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Languages</Form.Label>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 1, name: 'English' },
                    { id: 2, name: 'French' },
                    { id: 3, name: 'German' },
                  ].map((lang) => (
                    <Form.Check
                      key={lang.id}
                      type="checkbox"
                      label={lang.name}
                      checked={watch('languages')?.includes(lang.id)}
                      onChange={(e) => {
                        const current = watch('languages') || [];
                        if (e.target.checked) {
                          setValue('languages', [...current, lang.id]);
                        } else {
                          setValue(
                            'languages',
                            current.filter((l: number) => l !== lang.id),
                          );
                        }
                      }}
                    />
                  ))}
                </div>
                {errors.languages && (
                  <Form.Text className="text-danger">
                    {errors.languages.message as string}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>


            <Col md={6}>
              <Form.Group controlId="paymentMethods" className="mb-3">
                <Form.Label>Payment Methods</Form.Label>
                {[
                  { id: 'cash', name: 'Cash' },
                  { id: 'card', name: 'Card' },
                  { id: 'upi', name: 'UPI' },
                  { id: 'bank', name: 'Bank Transfer' },
                ].map((pm) => {
                  const current = watch('paymentMethods') || [];
                  return (
                    <Form.Check
                      key={pm.id}
                      type="checkbox"
                      label={pm.name}
                      checked={current.includes(pm.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue('paymentMethods', [...current, pm.id]);
                        } else {
                          setValue(
                            'paymentMethods',
                            current.filter((p: string) => p !== pm.id),
                          );
                        }
                      }}
                    />
                  );
                })}
                {errors.paymentMethods && (
                  <div className="text-danger">
                    {errors.paymentMethods.message}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* FAQ */}
          <Form.Group controlId="faq" className="mb-3">
            <Form.Label>FAQ</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register('faq')}
              placeholder="Enter FAQs"
              isInvalid={!!errors.faq}
            />
            <Form.Control.Feedback type="invalid">
              {errors.faq?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit">
            {therapistId ? 'Update Therapist' : 'Save Therapist'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AddTherapist;
