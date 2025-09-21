'use client';

import { API_BASE_PATH } from '@/context/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { createTherapist, updateTherapist } from '@/helpers/therapist';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row, Toast, ToastContainer } from 'react-bootstrap';
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
  photo?: string | null;
  contactEmail: string;
  contactPhone?: string;
  inamiNumber?: string;
  aboutMe?: string | null;
  degreesTraining?: string | null;
  departmentId?: number | null;
  specializationIds?: number[];
  branches?: BranchWithAvailability[];
  languages?: number[];
  faq?: string | null;
  paymentMethods?: string[];
}

const schema: yup.ObjectSchema<TherapistFormInputs> = yup.object({
  firstName: yup.string().required('Le prénom est obligatoire'),
  lastName: yup.string().required('Le nom de famille est obligatoire'),
  photo: yup.string().url('Doit être une URL valide').nullable(),
  contactEmail: yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'E-mail invalide')
    .required('L e-mail est requis'),
  contactPhone: yup.string()
    .required('Le numéro de téléphone est requis'),
  inamiNumber: yup.string().nullable(),
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
    .min(1, 'Au moins une spécialisation est requise')
    .required('La spécialisation est requise'),
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
  languages: yup.array().of(yup.number()).notRequired(),
  faq: yup.string().nullable(),
  paymentMethods: yup.array().of(yup.string()).notRequired(),
});

const AddTherapist: React.FC<AddTherapistProps> = ({ therapistId }) => {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [languagesList, setLanguages] = useState<Language[]>([]);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
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

  const safeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
  };

  const loadBranches = async (): Promise<Branch[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_PATH}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setBranches(safeArray(json));
      return safeArray(json);
    } catch {
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
      setDepartments(safeArray(json));
      return safeArray(json);
    } catch {
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
      setLanguages(safeArray(json));
      return safeArray(json);
    } catch {
      setLanguages([]);
      return [];
    }
  };

  useEffect(() => {
    if (!token) return;
    const loadSpecializations = async () => {
      try {
        const res = await fetch(`${API_BASE_PATH}/specializations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const arr = safeArray(json);
        const uniqueArr = arr.filter(
          (s: Specialization, idx: number, self: Specialization[]) =>
            idx === self.findIndex((sp) => sp.specialization_type === s.specialization_type),
        );
        setSpecializations(uniqueArr);
      } catch {
        setSpecializations([]);
      }
    };
    loadSpecializations();
  }, [token]);

  const mapTherapistToFormValues = (
    data: any,
    branchesList: Branch[],
    languagesList: Language[],
  ): TherapistFormInputs => {
    if (!data) return {
      firstName: '',
      lastName: '',
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
            if (typeof langNameOrObj === 'object' && langNameOrObj !== null)
              return langNameOrObj.language_id ?? langNameOrObj.id ?? undefined;
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

    return {
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
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
            reset(mapTherapistToFormValues(resp.data, branchesRes, languagesRes));
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

  const showNotification = (msg: string) => {
    setToastText(msg);
    setShowToast(true);
  };

  const transformPayload = (data: TherapistFormInputs) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    photo: data.photo,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    inamiNumber: data.inamiNumber,
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
        const langObj = languagesList.find((l) => l.id === id);
        return langObj ? langObj.name : null;
      })
      .filter((n) => n),
    faq: data.faq,
    paymentMethods: data.paymentMethods,
  });


  const onSubmit = async (data: TherapistFormInputs) => {
    try {
      const payload = transformPayload(data);
      let success = false;
      if (therapistId) {
        success = await updateTherapist(therapistId, payload);
      } else {
        success = await createTherapist(payload);
      }
      if (success) {
        showNotification(`Thérapeute ${therapistId ? 'mis à jour' : 'enregistré'} avec succès`);
        setTimeout(() => router.push('/therapists/therapists-list'), 1500);
      } else {
        showNotification('Erreur lors de la sauvegarde du thérapeute');
      }
    } catch (err: any) {
      showNotification(err.message || 'Erreur lors de l\'enregistrement du thérapeute');
    }
  };

  const branchesValue = watch('branches') || [];

  const AvailabilitySlots = ({ nestIndex }: { nestIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `branches.${nestIndex}.availability`,
    });
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return (
      <>
        <div style={{ marginBottom: '0.5rem' }}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            style={{ minWidth: '110px' }}
            onClick={() => append({ day: '', startTime: '', endTime: '' })}
          >
            Ajouter un créneau
          </Button>
        </div>
        {fields.map((field, k) => (
          <Row key={field.id} className="align-items-center">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Jour <span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <Form.Select
                  {...register(`branches.${nestIndex}.availability.${k}.day` as const)}
                  isInvalid={!!errors.branches?.[nestIndex]?.availability?.[k]?.day}
                >
                  <option value="">Sélectionner</option>
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
                <Form.Label>
                  Heure début <span style={{ color: 'red' }}>*</span>
                </Form.Label>
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
                <Form.Label>
                  Heure fin <span style={{ color: 'red' }}>*</span>
                </Form.Label>
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
            <Col md={2} className="d-flex align-items-center">
              <Button
                type="button"
                variant="danger"
                style={{ marginTop: '0.5rem' }}
                onClick={() => remove(k)}
              >
                Supprimer
              </Button>
            </Col>
          </Row>
        ))}
      </>
    );
  };

  return (
    <div className="position-relative">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          autohide
          delay={2500}
          bg="success"
        >
          <Toast.Body className="text-white">{toastText}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Card className="p-3 shadow-sm rounded">
        <CardBody>
          <h5 className="mb-4">{therapistId ? 'Modifier le thérapeute' : 'Ajouter un thérapeute'}</h5>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Prénom <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    {...register('firstName')}
                    placeholder="Entrez Prénom"
                    isInvalid={!!errors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nom de famille <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
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

            <Row>
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    E-mail <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
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
                  <Form.Label>
                    Numéro de téléphone <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Département <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
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
                  <Form.Label>
                    Spécialisation <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
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

            <h6>Succursale et disponibilité</h6>
            {branchFields.map((branch, index) => (
              <Card key={branch.id} className="mb-3 p-3">
                <Row className="align-items-center">
                  <Col md={9}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Succursale <span style={{ color: 'red' }}>*</span>
                      </Form.Label>
                      <Form.Select
                        {...register(`branches.${index}.branch_id` as const)}
                        isInvalid={!!errors.branches?.[index]?.branch_id}
                      >
                        <option value="">Sélectionnez une succursale</option>
                        {branches.map((b) => {
                          const isSelectedElsewhere = branchesValue.some((branch, idx) => {
                            return idx !== index && branch?.branch_id === b.branch_id;
                          });
                          return (
                            <option
                              key={b.branch_id}
                              value={b.branch_id}
                              disabled={isSelectedElsewhere}
                              style={isSelectedElsewhere ? { color: 'gray' } : {}}
                            >
                              {b.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.branches?.[index]?.branch_id?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-center justify-content-end">
                    <Button
                      type="button"
                      variant="danger"
                      style={{ paddingTop: '0.5rem' }}
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
              variant="primary"
              className="mb-3"
              onClick={() =>
                appendBranch({
                  branch_id: 0,
                  branch_name: '',
                  availability: [{ day: '', startTime: '', endTime: '' }],
                })
              }
              style={{ minWidth: '140px' }}
            >
              Ajouter une succursale
            </Button>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Langues</Form.Label>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {languagesList.length
                      ? languagesList.map((lang) => (
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
                        ))
                      : [1, 2, 3].map((id) => (
                          <Form.Check
                            key={id}
                            type="checkbox"
                            label={['English', 'French', 'German'][id - 1]}
                            checked={watch('languages')?.includes(id)}
                            onChange={(e) => {
                              const current = watch('languages') || [];
                              if (e.target.checked) setValue('languages', [...current, id]);
                              else
                                setValue(
                                  'languages',
                                  current.filter((l) => l !== id),
                                );
                            }}
                          />
                        ))}
                  </div>
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
                </Form.Group>
              </Col>
            </Row>

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

            <div className="d-flex gap-3 mt-3">
              <Button variant="primary" type="submit">
                {therapistId ? 'Mettre à jour le thérapeute' : 'Enregistrer le thérapeute'}
              </Button>
              <Button type="button" variant="danger" onClick={() => router.push('/therapists/therapists-list')}>
                Annuler
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddTherapist;
