'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useForm, Controller, useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  getTherapistTeamMemberById,
  updateTherapistTeamMember,
  createTherapistTeamMember,
} from '@/helpers/therapistTeam';
import { getAllLanguages } from '@/helpers/languages';
import { getBranches } from '@/helpers/branch';
import { getDepartments } from '@/helpers/department';
import { getSpecializations } from '@/helpers/specialization';
import { useNotificationContext } from '@/context/useNotificationContext';
import { DepartmentType, LanguageType, SpecializationType } from '@/types/data';

const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance'];
const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  contactEmail: yup.string().email('Invalid email').required('Email is required'),
  contactPhone: yup.string().required('Contact number is required'),
  languagesSpoken: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one language')
    .required(),
  full_name: yup.string(),
  imageUrl: yup.string().url('Must be a valid URL'),
  aboutMe: yup.string(),
  degreesTraining: yup.string(),
  inamiNumber: yup.string().optional().nullable(),
  payment_methods: yup.array().of(yup.string().required()),
  faq: yup.array().of(
    yup.object().shape({
      question: yup.string(),
      answer: yup.string(),
    }),
  ),
  website: yup.string().url('Must be a valid URL'),
  consultations: yup.string(),
  permissions: yup.object().shape({ admin: yup.boolean() }).required(),
  role: yup.string(),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
  isDelete: yup.boolean(),
  departmentId: yup.number().required('Department is required'),
  specializationIds: yup.array().of(yup.number()),
  branches: yup.array().of(
    yup.object().shape({
      branch_id: yup.number().required('Branch is required'),
      branch_name: yup.string(),
      availability: yup.array().of(
        yup.object().shape({
          day: yup.string(),
          startTime: yup.string(),
          endTime: yup.string(),
        }),
      ),
    }),
  ),
});

const defaultAvailability = [{ day: '', startTime: '', endTime: '' }];

const defaultValues: TherapistTeamMember = {
  firstName: '',
  lastName: '',
  full_name: '',
  imageUrl: '',
  contactEmail: '',
  contactPhone: '',
  aboutMe: '',
  degreesTraining: '',
  inamiNumber: '',
  payment_methods: [],
  faq: [{ question: '', answer: '' }],
  website: '',
  consultations: '',
  permissions: { admin: false },
  role: 'therapist',
  status: 'active',
  languagesSpoken: [],
  isDelete: false,
  departmentId: 0,
  specializationIds: [],
  branches: [
    {
      branch_id: 0,
      branch_name: '',
      availability: [...defaultAvailability],
    },
  ],
};

interface AddTherapistProps {
  editId?: string;
  isEdit?: boolean;
}

interface BranchType {
  branch_id: number;
  branch_name: string;
  availability: { day: string; startTime: string; endTime: string }[];
}

interface AvailabilitySlotsProps {
  nestIndex: number;
  control: Control<any>;
  register: UseFormRegister<any>;
}

type TherapistTeamMember = {
  firstName: string;
  lastName: string;
  full_name?: string;
  imageUrl?: string;
  contactEmail: string;
  contactPhone: string;
  aboutMe?: string;
  degreesTraining?: string;
  inamiNumber?: any;
  payment_methods?: string[];
  faq?: { question: string; answer: string }[];
  website?: string;
  consultations?: string;
  permissions: { admin?: boolean };
  role?: string;
  status: 'active' | 'inactive';
  languagesSpoken: string[];
  isDelete?: boolean;
  departmentId: number;
  specializationIds?: number[];
  branches: {
    branch_id: number;
    branch_name?: string;
    availability: { day: string; startTime: string; endTime: string }[];
  }[];
};

const AddTherapistTeamPage: React.FC<AddTherapistProps> = ({ editId }) => {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [loading, setLoading] = useState(false);
  const [branchesList, setBranchesList] = useState<{ branch_id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationType[]>([]);

  const {
    control,
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TherapistTeamMember>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const selectedLanguages = watch('languagesSpoken') || [];

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: 'branches',
  });

  useEffect(() => {
    getAllLanguages().then(setLanguages);
  }, []);
  useEffect(() => {
    getBranches(1, 100).then(({ data }) => setBranchesList(data));
  }, []);
  useEffect(() => {
    getDepartments(1, 100, '').then(({ data }) => setDepartments(data));
  }, []);
  useEffect(() => {
    getSpecializations().then(({ data }) => setSpecializations(data));
  }, []);

  useEffect(() => {
    if (editId && departments.length > 0) {
      setLoading(true);
      getTherapistTeamMemberById(editId).then((rawData) => {
        if (rawData) {
          const adaptedData = {
            ...rawData,

            departmentId: rawData.department?.id ? Number(rawData.department.id) : 0,

            // ✅ Specializations already array of ids
            specializationIds: (rawData.specializations || []).map((s: any) =>
              Number(s.specialization_id),
            ),

            // ✅ Languages are objects, pick names
            languagesSpoken: (rawData.languagesSpoken || []).map((l: any) => l.language_name),
            branches:
              Array.isArray(rawData.branches) && rawData.branches.length
                ? rawData.branches.map((branch: any) => ({
                    branch_id: Number(branch.branch_id),
                    branch_name: branch.name || '',
                    availability:
                      Array.isArray(rawData.availability) && rawData.availability.length
                        ? rawData.availability
                        : [{ day: '', startTime: '', endTime: '' }],
                  }))
                : [
                    {
                      branch_id: 0,
                      branch_name: '',
                      availability: [{ day: '', startTime: '', endTime: '' }],
                    },
                  ],

            faq:
              Array.isArray(rawData.faq) && rawData.faq.length
                ? rawData.faq
                : [{ question: '', answer: '' }],
            status: rawData.status === 'inactive' ? 'inactive' : 'active' as 'active' | 'inactive',
          };
          reset(adaptedData as TherapistTeamMember); // React Hook Form resets all fields to these values
          setFaqs(adaptedData.faq);
        }
        setLoading(false);
      });
    }
  }, [editId, reset, departments]);

  useEffect(() => {
    setValue(
      'full_name',
      `${watch('firstName')?.trim() ?? ''} ${watch('lastName')?.trim() ?? ''}`.trim(),
    );
  }, [watch('firstName'), watch('lastName'), setValue]);

  useEffect(() => setValue('faq', faqs), [faqs, setValue]);

  const onSubmit = async function (data: TherapistTeamMember) {
    const deptValue = data.departmentId;
    const departmentIdNum = deptValue && !isNaN(Number(deptValue)) ? Number(deptValue) : 0;

    // extract branchIds separately
    const branchIds = (data.branches || []).map((b) => Number(b.branch_id)).filter((id) => id > 0);

    // flatten availability across all branches
    const availability = (data.branches || []).flatMap((branch) =>
      (branch.availability || []).filter((slot) => slot.day && slot.startTime && slot.endTime),
    );

    const sanitizedData: any = {
      ...data,
      departmentId: departmentIdNum,
      specializationIds: (data.specializationIds || []).map(Number),
      payment_methods: (data.payment_methods || []).filter(Boolean),
      faq: faqs,
      languagesSpoken: (data.languagesSpoken || []).map(String),
      // Add required fields for API compatibility
      department: departments.find((d) => d.id === departmentIdNum) || null,
      specializations: (data.specializationIds || []).map((id) => {
        const spec = specializations.find((s) => s.id === id);
        return spec ? { specialization_id: spec.id, name: spec.name } : null;
      }).filter(Boolean),
      branchIds: (data.branches || []).map((b) => Number(b.branch_id)).filter((id) => id > 0),
      availability: (data.branches || []).flatMap((branch) =>
        (branch.availability || []).filter((slot) => slot.day && slot.startTime && slot.endTime)
      ),
    };

    try {
      const success = editId
        ? await updateTherapistTeamMember(editId, sanitizedData)
        : await createTherapistTeamMember(sanitizedData);

      if (success) {
        showNotification({
          message: `Therapist ${editId ? 'Updated' : 'Added'} Successfully`,
          variant: 'success',
        });
        router.push('/therapist-team/TherapistTeam-list');
      } else {
        showNotification({ message: 'Something Went Wrong', variant: 'danger' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: 'Submission failed due to error', variant: 'danger' });
    }
  };

  const AvailabilitySlots: React.FC<AvailabilitySlotsProps> = ({
    nestIndex,
    control,
    register,
  }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `branches.${nestIndex}.availability`,
    });

    return (
      <div className="mb-3">
        {/* <label>Availability for Branch</label> */}
        <Controller
          name={`branches.${nestIndex}.availability`}
          control={control}
          render={({ field }) =>
            field.value.map((item: any, availabilityIndex: number) => (
              <Row key={availabilityIndex} className="mb-2 align-items-center">
                <Col>
                  <Form.Select
                    value={item.day}
                    onChange={(e) => {
                      const newAvailability = [...field.value];
                      newAvailability[availabilityIndex].day = e.target.value;
                      field.onChange(newAvailability);
                    }}
                  >
                    <option value="">Select Jour</option>
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={item.startTime}
                    onChange={(e) => {
                      const newAvailability = [...field.value];
                      newAvailability[availabilityIndex].startTime = e.target.value;
                      field.onChange(newAvailability);
                    }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={item.endTime}
                    onChange={(e) => {
                      const newAvailability = [...field.value];
                      newAvailability[availabilityIndex].endTime = e.target.value;
                      field.onChange(newAvailability);
                    }}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      const newAvailability = [...field.value];
                      newAvailability.splice(availabilityIndex, 1);
                      field.onChange(newAvailability);
                    }}
                    disabled={field.value.length === 1}
                  >
                    Retirer
                  </Button>
                </Col>
              </Row>
            ))
          }
        />
        <Button
          type="button"
          variant="outline-primary"
          onClick={() => {
            const currentAvailability = watch(`branches.${nestIndex}.availability`) || [];
            setValue(`branches.${nestIndex}.availability`, [
              ...currentAvailability,
              { day: '', startTime: '', endTime: '' },
            ]);
          }}
        >
          Add disponibilité
        </Button>
      </div>
    );
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">
            {editId ? 'Modifier une thérapeutes équipe' : 'Ajouter une thérapeutes équipe'}
          </CardTitle>
        </CardHeader>
        <CardBody>
          {/* First & Last Name */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label> Prénom <span style={{ color: 'red' }}>*</span>

                </Form.Label>
                <Form.Control {...register('firstName')} isInvalid={!!errors.firstName} />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label> Nom de famille <span style={{ color: 'red' }}>*</span>

                </Form.Label>
                <Form.Control {...register('lastName')} isInvalid={!!errors.lastName} />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Image URL & Email */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Photo (URL)</Form.Label>
                <Form.Control {...register('imageUrl')} isInvalid={!!errors.imageUrl} />
                <Form.Control.Feedback type="invalid">
                  {errors.imageUrl?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label> E-mail <span style={{ color: 'red' }}>*</span>

                </Form.Label>
                <Form.Control {...register('contactEmail')} isInvalid={!!errors.contactEmail} />
                <Form.Control.Feedback type="invalid">
                  {errors.contactEmail?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Contact Phone & Inami Number */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label> Numéro de téléphone <span style={{ color: 'red' }}>*</span>

                </Form.Label>
                <Form.Control {...register('contactPhone')} isInvalid={!!errors.contactPhone} />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPhone?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Numéro INAMI</Form.Label>
                <Form.Control
                  type="number"
                  {...register('inamiNumber')}
                  isInvalid={!!errors.inamiNumber}
                />
                <Form.Control.Feedback type="invalid">{!!errors.inamiNumber}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* About Me */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Sur moi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('aboutMe')}
                  isInvalid={!!errors.aboutMe}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.aboutMe?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Degrees & Training */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Diplômes et formations</Form.Label>
                <Form.Control
                  {...register('degreesTraining')}
                  isInvalid={!!errors.degreesTraining}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.degreesTraining?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Consultations */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Consultations</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  {...register('consultations')}
                  isInvalid={!!errors.consultations}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.consultations?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Website */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Website</Form.Label>
                <Form.Control {...register('website')} isInvalid={!!errors.website} />
                <Form.Control.Feedback type="invalid">
                  {errors.website?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Languages Spoken */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Languages <span style={{ color: 'red' }}>*</span>

                </Form.Label>
                <div className="d-flex flex-wrap gap-3">
                  {languages.map(({ id, language_name }) => (
                    <Form.Check
                      key={id}
                      type="checkbox"
                      label={language_name}
                      checked={(watch('languagesSpoken') || []).includes(language_name)}
                      onChange={(e) => {
                        const current: string[] = watch('languagesSpoken') || [];
                        if (e.target.checked) {
                          setValue('languagesSpoken', [...current, language_name]); // ✅ send names
                        } else {
                          setValue(
                            'languagesSpoken',
                            current.filter((lang) => lang !== language_name),
                          );
                        }
                      }}
                      className="me-2"
                    />
                  ))}
                </div>
                {errors.languagesSpoken && (
                  <div className="text-danger">{errors.languagesSpoken.message}</div>
                )}
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Méthodes de paiement</Form.Label>

                {/* ✅ Flex container for horizontal layout */}
                <div className="d-flex flex-wrap gap-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <Form.Check
                      key={pm}
                      type="checkbox"
                      label={pm}
                      checked={(watch('payment_methods') || []).includes(pm)}
                      onChange={(e) => {
                        const current = watch('payment_methods') || [];
                        if (e.target.checked) {
                          setValue('payment_methods', [...current, pm]);
                        } else {
                          setValue(
                            'payment_methods',
                            current.filter((p) => p !== pm),
                          );
                        }
                      }}
                      className="me-2"
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* FAQ
          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Questions fréquemment posées</Form.Label>
                {faqs.map((item, idx) => (
                  <Row key={idx} className="mb-2">
                    <Col>
                      <Form.Control
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) => {
                          const newFaqs = [...faqs];
                          newFaqs[idx].question = e.target.value;
                          setFaqs(newFaqs);
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        placeholder="Answer"
                        value={item.answer}
                        onChange={(e) => {
                          const newFaqs = [...faqs];
                          newFaqs[idx].answer = e.target.value;
                          setFaqs(newFaqs);
                        }}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="danger"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        disabled={faqs.length === 1}
                      >
                         Retirer
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                >
                   Ajouter une FAQ
                </Button>
              </Form.Group>
            </Col>
          </Row> */}

          {/* Department Select */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label> Département <span style={{ color: 'red' }}>*</span>

                </Form.Label>
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Form.Select
                      {...field}
                      value={field.value || 0} // store as number
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value={0}>Select Department</option>
                      {departments
                        .filter((dept) => dept.id !== null && dept.id !== undefined)
                        .map((dept) => (
                          <option key={dept.id} value={dept.id!.toString()}>
                            {dept.name}
                          </option>
                        ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.departmentId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Spécialisation <span style={{ color: 'red' }}>*</span>

                </Form.Label>

                {/* ✅ Flex container for horizontal layout */}
                <div className="d-flex flex-wrap gap-3">
                  {specializations.map((spec) => (
                    <Form.Check
                      key={spec.id}
                      type="checkbox"
                      label={spec.name} // show name instead of id
                      checked={(watch('specializationIds') || []).includes(spec.id)}
                      onChange={(e) => {
                        const current = watch('specializationIds') || [];
                        if (e.target.checked) {
                          setValue('specializationIds', [...current, spec.id]);
                        } else {
                          setValue(
                            'specializationIds',
                            current.filter((id) => id !== spec.id),
                          );
                        }
                      }}
                      className="me-2"
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Branch & Availability */}
          <Form.Label>Succursale et disponibilité</Form.Label>
          {branchFields.map((branch, nestIndex) => (
            <Card key={branch.id || nestIndex} className="mb-3 p-3">
              <Row className="align-items-center">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sélectionnez une succursale</Form.Label>
                    <Form.Select
                      {...register(`branches.${nestIndex}.branch_id`, { valueAsNumber: true })}
                      isInvalid={!!errors.branches?.[nestIndex]?.branch_id}
                    >
                      <option value="">Select succursale</option>
                      {branchesList.map((b) => (
                        <option key={b.branch_id} value={b.branch_id}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.branches?.[nestIndex]?.branch_id?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-center justify-content-start">
                  <Button type="button" variant="danger" onClick={() => removeBranch(nestIndex)}>
                    Supprimer la branche
                  </Button>
                </Col>
              </Row>
              <AvailabilitySlots nestIndex={nestIndex} control={control} register={register} />
            </Card>
          ))}
          <Row>
            <Button
              type="button"
              variant="primary"
              size="sm"
              style={{ width: '200px', borderRadius: '5px' }}
              className="narrow-btn"
              onClick={() =>
                appendBranch({
                  branch_id: 0,
                  branch_name: '',
                  availability: [...defaultAvailability],
                })
              }
            >
              Ajouter une succursale
            </Button>
          </Row>

          {/* FAQ */}
          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Questions fréquemment posées</Form.Label>
                {faqs.map((item, idx) => (
                  <Row key={idx} className="mb-2">
                    <Col>
                      <Form.Control
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) => {
                          const newFaqs = [...faqs];
                          newFaqs[idx].question = e.target.value;
                          setFaqs(newFaqs);
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        placeholder="Answer"
                        value={item.answer}
                        onChange={(e) => {
                          const newFaqs = [...faqs];
                          newFaqs[idx].answer = e.target.value;
                          setFaqs(newFaqs);
                        }}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="danger"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        disabled={faqs.length === 1}
                      >
                        Retirer
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                >
                  Ajouter une FAQ
                </Button>
              </Form.Group>
            </Col>
          </Row>

          {/* Status & Role */}
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Form.Select
                      {...field}
                      value={field.value || 'active'}
                      isInvalid={!!errors.status}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.status?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Rôle</Form.Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.role}>
                      <option value="super_admin">Super-Admin</option>
                      <option value="admin">Admin</option>
                      <option value="therapist">Therapist</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">{errors.role?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Submit & Cancel */}
          <Row className="justify-content-end g-2 mt-2">
            <Col lg={2}>
              <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                {editId ? 'Update' : 'Create'} Therapist
              </Button>
            </Col>
            <Col lg={2}>
              <Button
                variant="danger"
                className="w-100"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </form>
  );
};

export default AddTherapistTeamPage;
