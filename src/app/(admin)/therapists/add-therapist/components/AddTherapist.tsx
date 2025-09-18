'use client';
import { API_BASE_PATH } from '@/context/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row } from 'react-bootstrap';
import { useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';

type AddTherapistProps = { therapistId?: string };

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
  branch_name: string | null;
  availability: Availability[];
}

interface TherapistFormInputs {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  photo?: string | null;
  contactEmail: string;
  contactPhone?: string;
  inamiNumber: string;
  aboutMe?: string | null;
  degreesTraining?: string | null;
  departmentId?: number | null;
  specializationIds?: number[];
  branches?: BranchWithAvailability[];
  languages?: number[]; // selected language IDs
  faq?: string | null;
  paymentMethods?: string[];
}

const schema: yup.ObjectSchema<TherapistFormInputs> = yup.object({
  firstName: yup.string().required('Le prénom est obligatoire'),
  lastName: yup.string().required('Le nom de famille est obligatoire'),
  fullName: yup.string().required('Le nom complet est requis'),
  photo: yup.string().url('Doit être une URL valide').nullable(),
  contactEmail: yup.string().email('E-mail invalide').required('L e-mail est requis'),
  contactPhone: yup
    .string()
    .matches(/^\+?[0-9]{7,15}$/, 'Téléphone invalide')
    .required('Le numéro de téléphone est requis'),
  inamiNumber: yup.string().required('Numéro INAMI is required'),
  aboutMe: yup.string().nullable(),
  degreesTraining: yup.string().nullable(),
  departmentId: yup
    .number()
    .nullable()
    .typeError('Le département est requis')
    .required('Le département est requis'),
  specializationIds: yup
    .array()
    .of(yup.number().required())
    .min(1, 'Au moins une spécialisation est requise'),
  branches: yup
    .array()
    .of(
      yup.object({
        branch_id: yup.number().required('Une succursale est requise'),
        branch_name: yup.string().nullable().defined(),
        availability: yup
          .array()
          .of(
            yup.object({
              day: yup.string().required('La journée est obligatoire'),
              startTime: yup.string().required('L`heure de début est requise'),
              endTime: yup.string().required('L`heure de fin est requise'),
            }),
          )
          .min(1, 'Au moins un créneau de disponibilité est requis')
          .required('La disponibilité est requise'),
      }),
    )
    .min(1, 'Au moins une branche est requise')
    .required('Des succursales sont nécessaires')
    .defined(),
  languages: yup.array().of(yup.number().required()).min(1, 'Au moins une langue est requise'),
  faq: yup.string().nullable(),
  paymentMethods: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Au moins un mode de paiement est requis'),
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
    if (res?.data && Array.isArray(res.data)) return res.data;
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
  // Specializations loader based on department
  useEffect(() => {
    if (!token) {
      setSpecializations([]);
      return;
    }
    const loadSpecializations = async () => {
      try {
        const res = await fetch(`${API_BASE_PATH}/specializations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const arr = safeArray(json);

        // ✅ Deduplicate by specialization_type
        const uniqueArr = arr.filter(
          (s: Specialization, index: number, self: Specialization[]) =>
            index === self.findIndex((sp) => sp.specialization_type === s.specialization_type),
        );

        setSpecializations(uniqueArr);
      } catch (err) {
        console.error('Error loading specializations:', err);
        setSpecializations([]);
      }
    };
    loadSpecializations();
  }, [token]);

  // --- Mapping API therapist -> form
  const mapTherapistToFormValues = (
    data: any,
    branchesList: Branch[],
    languagesList: Language[],
  ): TherapistFormInputs => {
    if (!data)
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

    const specializationIds: number[] = Array.isArray(data.specializations)
      ? data.specializations.map((s: any) =>
          typeof s === 'number' ? s : s.specialization_id || s.id,
        )
      : [];

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
          const availabilityForThisBranch =
            rootAvailability.length > 0
              ? rootAvailability.map((a) => ({ ...a }))
              : [{ day: '', startTime: '', endTime: '' }];
          return {
            branch_id: branchId,
            branch_name: branchName,
            availability: availabilityForThisBranch,
          };
        })
      : [];

    const langIds: number[] = Array.isArray(data.languages)
      ? data.languages
          .map((langNameOrObj: any) => {
            if (typeof langNameOrObj === 'number') return langNameOrObj;
            if (typeof langNameOrObj === 'object' && langNameOrObj !== null) {
              const langName = langNameOrObj.name?.toLowerCase();
              if (langName === 'english') return 1;
              if (langName === 'french') return 2;
              if (langName === 'german') return 3;
            }
            if (typeof langNameOrObj === 'string') {
              const langName = langNameOrObj.toLowerCase();
              if (langName === 'english') return 1;
              if (langName === 'french') return 2;
              if (langName === 'german') return 3;
            }

            return undefined;
          })
          .filter((id: any) => typeof id === 'number')
      : [];

    return {
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
  };

  // --- Init load
  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const [branchesRes, departmentsRes, languagesRes] = await Promise.all([
          loadBranches(),
          loadDepartments(),
          loadLanguages(),
        ]);
        setDropdownsLoaded(true);

        if (therapistId) {
          try {
            const resp = await axios.get(`${API_BASE_PATH}/therapists/${therapistId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const mapped = mapTherapistToFormValues(resp.data, branchesRes, languagesRes);
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
  }, [token, therapistId, reset]);

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
    branches: data.branches?.map((b) => b.branch_id),
    availability: data.branches?.flatMap((b) =>
      b.availability.map((av) => ({ ...av, branchId: b.branch_id })),
    ),
    languages: data.languages
      ?.map((id) => {
        if (id === 1) return 'English';
        if (id === 2) return 'French';
        if (id === 3) return 'German';
        return null;
      })
      .filter((n) => n),

    faq: data.faq,
    paymentMethods: data.paymentMethods,
  });

  const onSubmit = async (data: TherapistFormInputs) => {
    try {
      const payload = transformPayload(data);
      const url = therapistId
        ? `${API_BASE_PATH}/therapists/${therapistId}`
        : `${API_BASE_PATH}/therapists`;
      const method = therapistId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
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

  const AvailabilitySlots = ({ nestIndex }: { nestIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `branches.${nestIndex}.availability`,
    });
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return (
      <>
        {fields.map((field, k) => (
          <Row key={field.id} className="align-items-center">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Day</Form.Label>
                <Form.Select
                  {...register(`branches.${nestIndex}.availability.${k}.day` as const)}
                  isInvalid={!!errors.branches?.[nestIndex]?.availability?.[k]?.day}
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.branches?.[nestIndex]?.availability?.[k]?.day?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  {...register(`branches.${nestIndex}.availability.${k}.startTime` as const)}
                  isInvalid={!!errors.branches?.[nestIndex]?.availability?.[k]?.startTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.branches?.[nestIndex]?.availability?.[k]?.startTime?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  {...register(`branches.${nestIndex}.availability.${k}.endTime` as const)}
                  isInvalid={!!errors.branches?.[nestIndex]?.availability?.[k]?.endTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.branches?.[nestIndex]?.availability?.[k]?.endTime?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                type="button"
                variant="danger"
                style={{ marginTop: '1.7rem' }}
                onClick={() => remove(k)}
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
          onClick={() => append({ day: '', startTime: '', endTime: '' })}
        >
          Add Slot
        </Button>
      </>
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit, (errors) => console.log('Validation errors:', errors))}>
      <Card className="p-3 shadow-sm rounded">
        <CardBody>
          <h5 className="mb-4">
            {therapistId ? 'Modifier le thérapeute' : 'Ajouter un thérapeute'}
          </h5>
          {/* <Form
          onSubmit={handleSubmit(onSubmit, (errors) => console.log('Validation errors:', errors))} */}
          {/* > */}
          {/* First name / Last name */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  {...register('firstName')}
                  placeholder="Entre Prénom"
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nom de famille</Form.Label>
                <Form.Control
                  type="text"
                  {...register('lastName')}
                  placeholder="Entrez Nom de famille"
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
              <Form.Group className="mb-3">
                <Form.Label>Nom et prénom</Form.Label>
                <Form.Control
                  type="text"
                  {...register('fullName')}
                  placeholder="Nom et prénom"
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
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

          {/* E-mail, Phone */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  {...register('contactEmail')}
                  placeholder="Entrez votre adresse e-mail"
                  isInvalid={!!errors.contactEmail}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactEmail?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Numéro de téléphone</Form.Label>
                <Form.Control
                  type="text"
                  {...register('contactPhone')}
                  placeholder="Entrez le numéro de téléphone"
                  isInvalid={!!errors.contactPhone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPhone?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Numéro INAMI, Diplômes et formations */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Numéro INAMI</Form.Label>
                <Form.Control
                  type="text"
                  {...register('inamiNumber')}
                  placeholder="Enter Numéro INAMI"
                  isInvalid={!!errors.inamiNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.inamiNumber?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Diplômes et formations</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('degreesTraining')}
                  placeholder="Entrez Diplômes et formations"
                  isInvalid={!!errors.degreesTraining}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.degreesTraining?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Sur moi */}
          <Form.Group className="mb-3">
            <Form.Label>Sur moi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register('aboutMe')}
              placeholder="Entrez la description"
              isInvalid={!!errors.aboutMe}
            />
            <Form.Control.Feedback type="invalid">{errors.aboutMe?.message}</Form.Control.Feedback>
          </Form.Group>

          {/* Department + Specializations */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Département</Form.Label>
                <Form.Select {...register('departmentId')} isInvalid={!!errors.departmentId}>
                  <option value="">Sélectionnez un département</option>
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
                <Form.Label>Spécialisation</Form.Label>
                <div>
                  {specializations.length ? (
                    specializations.map((s) => (
                      <Form.Check
                        inline
                        key={s.specialization_id}
                        type="checkbox"
                        label={s.specialization_type}
                        checked={watch('specializationIds')?.includes(s.specialization_id)}
                        onChange={(e) => {
                          const current = watch('specializationIds') || [];
                          if (e.target.checked)
                            setValue('specializationIds', [...current, s.specialization_id]);
                          else
                            setValue(
                              'specializationIds',
                              current.filter((id) => id !== s.specialization_id),
                            );
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-muted">Aucune spécialisation disponible</p>
                  )}
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
          <h6>Succursale et disponibilité</h6>
          {branchFields.map((branch, index) => (
            <Card key={branch.id} className="mb-3 p-3">
              <Row className="align-items-center">
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Branch</Form.Label>
                    <Form.Select
                      {...register(`branches.${index}.branch_id` as const)}
                      isInvalid={!!errors.branches?.[index]?.branch_id}
                    >
                      <option value="">Sélectionnez une succursale</option>
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
                    Supprimer la branche
                  </Button>
                </Col>
              </Row>
              <AvailabilitySlots nestIndex={index} />
            </Card>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="mb-3"
            onClick={() =>
              appendBranch({
                branch_id: 0,
                branch_name: '',
                availability: [{ day: '', startTime: '', endTime: '' }],
              })
            }
          >
            Ajouter une succursale
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
                        if (e.target.checked) setValue('languages', [...current, lang.id]);
                        else
                          setValue(
                            'languages',
                            current.filter((l) => l !== lang.id),
                          );
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
              <Form.Group className="mb-3">
                <Form.Label>Méthodes de paiement</Form.Label>
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
                        if (e.target.checked) setValue('paymentMethods', [...current, pm.id]);
                        else
                          setValue(
                            'paymentMethods',
                            current.filter((p) => p !== pm.id),
                          );
                      }}
                    />
                  );
                })}
                {errors.paymentMethods && (
                  <div className="text-danger">{errors.paymentMethods.message}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* FAQ */}
          <Form.Group className="mb-3">
            <Form.Label>FAQ</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register('faq')}
              placeholder="Enter FAQs"
              isInvalid={!!errors.faq}
            />
            <Form.Control.Feedback type="invalid">{errors.faq?.message}</Form.Control.Feedback>
          </Form.Group>

          {/* Submit button fixed bottom */}
          {/* <div
            className="d-flex justify-content-end p-3 bg-white shadow"
            style={{ position: 'sticky', bottom: 0, zIndex: 1000 }}
          >
            <Button variant="primary" type="submit" className="px-4 py-2 rounded-2">
              {therapistId ? 'Mettre à jour le thérapeute' : 'Enregistrer le thérapeute'}
            </Button>
          </div>
        </Form> */}
        </CardBody>
      </Card>

      <Row>
        <Col className="d-flex justify-content-end">
          <Button variant="primary" type="submit" className="px-4 py-2">
            {therapistId ? 'Mettre à jour le thérapeute' : 'Enregistrer le thérapeute'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AddTherapist;
