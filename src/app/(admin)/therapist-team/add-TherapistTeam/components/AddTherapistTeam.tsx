'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
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
import { getTherapistTeamMemberById, updateTherapistTeamMember, createTherapistTeamMember } from '@/helpers/therapistTeam';
import { getAllLanguages } from '@/helpers/languages';
import { LanguageType } from '@/types/data';

export interface TherapistTeamMember {
  firstName: string;
  lastName: string;
  full_name: string;
  imageUrl: string;
  contactEmail: string;
  contactPhone: string;
  aboutMe: string;
  degreesTraining: string;
  inamiNumber: number;
  payment_methods: string[];
  faq: { question: string; answer: string }[];
  website: string;
  consultations: string;
  permissions: { admin: boolean };
  role: string;
  status: "active" | "inactive";
  availability: { day: string; startTime: string; endTime: string }[];
  languagesSpoken: string[];
  isDelete: boolean;
  departmentId: number;
  specializationIds: number[];
  branchIds: number[];
}

const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance'];
const BRANCHES = [
  { id: 1, name: 'Branch 1' },
  { id: 2, name: 'Branch 2' },
];

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  full_name: yup.string().required(),
  imageUrl: yup.string().url('Must be a valid URL').required('Profile image is required'),
  contactEmail: yup.string().email('Invalid email').required('Email is required'),
  contactPhone: yup.string().required('Contact number is required'),
  aboutMe: yup.string().required('About Me is required'),
  degreesTraining: yup.string().required('Degrees & Training required'),
  inamiNumber: yup.number().typeError('Must be a number').required('Inami number is required'),

  payment_methods: yup.array().of(yup.string().required()).min(1, 'Select at least one payment method').required(),
  faq: yup.array().of(
    yup.object().shape({
      question: yup.string().required(),
      answer: yup.string().required(),
    })
  ).required('FAQ is required'),

  website: yup.string().url('Must be a valid URL').required('Website is required'),
  consultations: yup.string().required('Consultation info required'),
  permissions: yup.object().shape({ admin: yup.boolean().required() }),
  role: yup.string().required(),
  status: yup.string().oneOf(['active', 'inactive']).required(),
  availability: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.string().required('Day required'),
        startTime: yup.string().required('Start time required'),
        endTime: yup.string().required('End time required'),
      })
    )
    .min(1, 'Add at least one availability slot')
    .required(),
  languagesSpoken: yup.array().of(yup.string().required()).min(1, 'Select at least one language').required(),
  isDelete: yup.boolean().required(),
  departmentId: yup.number().typeError('Department ID required').required(),
  specializationIds: yup.array().of(yup.number().required()).min(1, 'Add at least one specialization').required(),
  branchIds: yup.array().of(yup.number().required()).min(1, 'Select at least one branch').required(),
});


const defaultAvailability = [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }];

const defaultValues: TherapistTeamMember = {
  firstName: '',
  lastName: '',
  full_name: '',
  imageUrl: '',
  contactEmail: '',
  contactPhone: '',
  aboutMe: '',
  degreesTraining: '',
  inamiNumber: 0,
  payment_methods: [],
  faq: [],
  website: '',
  consultations: '',
  permissions: { admin: false },
  role: 'staff',
  status: 'active',
  availability: defaultAvailability,
  languagesSpoken: [],
  isDelete: false,
  departmentId: 0,
  specializationIds: [],
  branchIds: [],
};

interface AddTherapistProps {
  editId?: string;
}

const AddTherapistTeamPage: React.FC<AddTherapistProps> = ({ editId }) => {
  const [languages, setLanguages] = useState<LanguageType[]>([]);

  useEffect(() => {
    async function fetchLanguages() {
      const data = await getAllLanguages();
      setLanguages(data);
    }
    fetchLanguages();
  }, []);

  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const {
    control,
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TherapistTeamMember>({ resolver: yupResolver(schema), defaultValues });

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
      { question: '', answer: '' },
    ]);


  useEffect(() => {
      if (editId) {
        getTherapistTeamMemberById(editId).then((data) => {
          if (data) {
            reset(data);
            setFaqs(
              data.faq?.length
                ? data.faq
                : [{ question: '', answer: '' }]
            );
          }
        });
      }
    }, [editId, reset]);


  useEffect(() => {
      setValue('faq', faqs);
    }, [faqs, setValue]);


  useEffect(() => {
    const first = watch('firstName')?.trim() ?? '';
    const last = watch('lastName')?.trim() ?? '';
    setValue('full_name', `${first} ${last}`.trim());
  }, [watch('firstName'), watch('lastName'), setValue]);

  const onSubmit = async (data: TherapistTeamMember) => {
      const sanitizedData = {
      ...data,
      payment_methods: data.payment_methods.filter(Boolean),
      faq: data.faq.filter(Boolean),
      availability: data.availability.filter(slot => slot.day && slot.startTime && slot.endTime),
      languagesSpoken: data.languagesSpoken.filter(Boolean),
    };
    let success = false;
    if (editId) {
      success = await updateTherapistTeamMember(editId, { ...data, faq: faqs });
    } else {
      success = await createTherapistTeamMember({ ...data, faq: faqs });
    }
    if (success) {
      showNotification({ message: `Therapist ${editId ? 'Updated' : 'Added'} Successfully`, variant: 'success' });
      router.push('/teams/teams-list');
    } else {
      showNotification({ message: 'Something Went Wrong', variant: 'danger' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">{editId ? 'Edit Therapist' : 'Add Therapist'}</CardTitle>
        </CardHeader>
        <CardBody>
          {/* First & Last Name */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control {...register('firstName')} isInvalid={!!errors.firstName} />
                <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control {...register('lastName')} isInvalid={!!errors.lastName} />
                <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Image & Email */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Profile Image URL</Form.Label>
                <Form.Control {...register('imageUrl')} isInvalid={!!errors.imageUrl} />
                <Form.Control.Feedback type="invalid">{errors.imageUrl?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control {...register('contactEmail')} isInvalid={!!errors.contactEmail} />
                <Form.Control.Feedback type="invalid">{errors.contactEmail?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Phone & Inami Number */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control {...register('contactPhone')} isInvalid={!!errors.contactPhone} />
                <Form.Control.Feedback type="invalid">{errors.contactPhone?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Inami Number</Form.Label>
                <Form.Control type="number" {...register('inamiNumber')} isInvalid={!!errors.inamiNumber} />
                <Form.Control.Feedback type="invalid">{errors.inamiNumber?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* About Me */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>About Me</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('aboutMe')} isInvalid={!!errors.aboutMe} />
                <Form.Control.Feedback type="invalid">{errors.aboutMe?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Degrees & Training */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Degrees & Training</Form.Label>
                <Form.Control {...register('degreesTraining')} isInvalid={!!errors.degreesTraining} />
                <Form.Control.Feedback type="invalid">{errors.degreesTraining?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Consultations */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Consultations</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('consultations')} isInvalid={!!errors.consultations} />
                <Form.Control.Feedback type="invalid">{errors.consultations?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Website, Status, Role */}
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Website</Form.Label>
                <Form.Control {...register('website')} isInvalid={!!errors.website} />
                <Form.Control.Feedback type="invalid">{errors.website?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.status}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.role}>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">{errors.role?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Languages Spoken & Payment Methods */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Languages Spoken</Form.Label>
                {languages.map(({ _id, label }) => (
                  <Form.Check
                    key={_id}
                    type="checkbox"
                    label={label}
                    checked={watch('languagesSpoken').includes(_id)}
                    onChange={(e) => {
                      const current = watch('languagesSpoken');
                      if (e.target.checked) {
                        setValue('languagesSpoken', [...current, _id]);
                      } else {
                        setValue('languagesSpoken', current.filter((l) => l !== _id));
                      }
                    }}
                  />
                ))}
                {errors.languagesSpoken && <div className="text-danger">{errors.languagesSpoken.message}</div>}
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Payment Methods</Form.Label>
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
                        setValue('payment_methods', current.filter((p) => p !== pm));
                      }
                    }}
                  />
                ))}
                {errors.payment_methods && <div className="text-danger">{errors.payment_methods.message}</div>}
              </Form.Group>
            </Col>
          </Row>

          {/* FAQ */}
          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label>FAQ</Form.Label>
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
                        Remove
                      </Button>
                    </Col>
                  </Row>
                  ))}
                <Button variant="outline-primary" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}>
                    Add FAQ
                </Button>
              </Form.Group>
            </Col>
          </Row>

          {/* Availability */}
          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Availability</Form.Label>
                {watch('availability').map((slot, idx) => (
                  <Row key={idx} className="mb-2 align-items-center">
                    <Col>
                      <Form.Control
                        placeholder="Day"
                        value={slot.day}
                        onChange={(e) => {
                          const newAvail = [...watch('availability')];
                          newAvail[idx].day = e.target.value;
                          setValue('availability', newAvail);
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="time"
                        placeholder="Start Time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const newAvail = [...watch('availability')];
                          newAvail[idx].startTime = e.target.value;
                          setValue('availability', newAvail);
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="time"
                        placeholder="End Time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const newAvail = [...watch('availability')];
                          newAvail[idx].endTime = e.target.value;
                          setValue('availability', newAvail);
                        }}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="danger"
                        onClick={() => setValue('availability', watch('availability').filter((_, i) => i !== idx))}
                        disabled={watch('availability').length === 1}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() =>
                    setValue('availability', [...watch('availability'), { day: '', startTime: '', endTime: '' }])
                  }
                >
                  Add Availability
                </Button>
              </Form.Group>
            </Col>
          </Row>

          {/* Specializations */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Specializations (comma-separated IDs)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: 1,2,3"
                  {...register('specializationIds')}
                  onChange={(e) => {
                    setValue(
                      'specializationIds',
                      e.target.value
                        .split(',')
                        .map((id) => Number(id.trim()))
                        .filter((id) => !isNaN(id))
                    );
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.specializationIds?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Branches</Form.Label>
                {BRANCHES.map((branch) => (
                  <Form.Check
                    key={branch.id}
                    type="checkbox"
                    label={branch.name}
                    checked={watch('branchIds').includes(branch.id)}
                    onChange={(e) => {
                      const current = watch('branchIds');
                      if (e.target.checked) {
                        setValue('branchIds', [...current, branch.id]);
                      } else {
                        setValue('branchIds', current.filter((id) => id !== branch.id));
                      }
                    }}
                  />
                ))}
                {errors.branchIds && <div className="text-danger">{errors.branchIds.message}</div>}
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-3 rounded">
              <Row className="justify-content-end g-2 mt-2">
                  <Col lg={2}>
                    <Button variant="primary" type="submit" className="w-100">
                      {editId ? 'Mise à jour' : 'Créer'} Therapist Team
                    </Button>
                  </Col>
                  <Col lg={2}>
                    <Button variant="danger" className="w-100" onClick={() => router.back()}>
                      Annuler
                    </Button>
                  </Col>
              </Row>
            </div>
        </CardBody>
      </Card>
    </form>
  );
};

export default AddTherapistTeamPage;
