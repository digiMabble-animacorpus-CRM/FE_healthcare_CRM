'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Row, Col, Button, Card, CardBody } from 'react-bootstrap';
import { API_BASE_PATH } from '@/context/constants';

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

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

interface BranchWithAvailability {
  branch_id: number;
  branch_name: string;
  availability: Availability[];
}

interface TherapistFormInputs {
  // 1️⃣ Basic Info
  firstName: string;
  lastName: string;
  fullName: string;
  photo: string;
  contactEmail: string;
  contactPhone: string;

  // 2️⃣ Professional Details
  inamiNumber: string;
  aboutMe: string;
  consultations: string;
  degreesTraining: string;
  departmentId: string;
  specializationIds: number[];

  // 3️⃣ Branch & Availability
  branches: BranchWithAvailability[];

  // 4️⃣ Additional Info
  languages: number[];
  faq: string;
  paymentMethods: string[];
}

// ✅ Validation schema
const schema = yup.object({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  fullName: yup.string().required('Full Name is required'),
  photo: yup.string().url('Must be a valid URL').nullable(),
  contactEmail: yup.string().email('Invalid email').required('Email is required'),
  contactPhone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number')
    .required('Phone number is required'),
  inamiNumber: yup.string().required('INAMI Number is required'),
  aboutMe: yup.string().nullable(),
  consultations: yup.string().nullable(),
  degreesTraining: yup.string().nullable(),
  departmentId: yup.string().required('Department is required'),
  specializationIds: yup
    .array()
    .of(yup.number().required())
    .min(1, 'At least one specialization is required'),
  branches: yup
    .array()
    .of(
      yup.object({
        branch_id: yup.number().required('Branch is required'),
        branch_name: yup.string().nullable(),
        availability: yup
          .array()
          .of(
            yup.object({
              day: yup.string().required('Day is required'),
              startTime: yup.string().required('Start time is required'),
              endTime: yup.string().required('End time is required'),
            }),
          )
          .min(1, 'At least one availability slot is required'),
      }),
    )
    .min(1, 'At least one branch is required'),
  languages: yup.string().required('Languages is required'),
  faq: yup.string().nullable(),
  paymentMethods: yup.string().required('Payments is required'),
});

const TherapistForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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
      aboutMe: '',
      consultations: '',
      degreesTraining: '',
      departmentId: '',
      specializationIds: [],
      branches: [],
      languages: [],
      faq: '',
      paymentMethods: [],
    },
  });

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({ control, name: 'branches' });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const departmentId = watch('departmentId');
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // ✅ Auto update fullName
  useEffect(() => {
    setValue('fullName', `${firstName || ''} ${lastName || ''}`.trim());
  }, [firstName, lastName, setValue]);

  const safeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  // ✅ Load Data APIs
  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch(`${API_BASE_PATH}/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(safeArray(await res.json()));
      } catch {
        setBranches([]);
      }
    }
    if (token) loadBranches();
  }, [token]);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await fetch(`${API_BASE_PATH}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(safeArray(await res.json()));
      } catch {
        setDepartments([]);
      }
    }
    if (token) loadDepartments();
  }, [token]);

  useEffect(() => {
    if (!departmentId) {
      setSpecializations([]);
      setValue('specializationIds', []);
      return;
    }
    async function loadSpecializations() {
      try {
        const res = await fetch(`${API_BASE_PATH}/specializations?departmentId=${departmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpecializations(safeArray(await res.json()));
      } catch {
        setSpecializations([]);
      }
    }
    loadSpecializations();
  }, [departmentId]);

  useEffect(() => {
    async function loadLanguages() {
      try {
        const res = await fetch(`${API_BASE_PATH}/languages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLanguages(safeArray(await res.json()));
      } catch {
        setLanguages([]);
      }
    }
    if (token) loadLanguages();
  }, [token]);

  // ✅ Submit Handler
  const onSubmit = async (data: TherapistFormInputs) => {
    try {
      const res = await fetch(`${API_BASE_PATH}/therapists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (res.status === 200) {
        alert('Therapist saved successfully ✅');
      } else {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving therapist ');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        {/* 1️⃣ Basic Information */}
        <Col md={12}>
          <h5 className="mt-3 mb-3">Basic Information</h5>
        </Col>
       <Card>
         <CardBody>
        <Col lg={6}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" {...register('firstName')} />
            {errors.firstName && (
              <Form.Text className="text-danger">{errors.firstName.message}</Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" {...register('lastName')} />
            {errors.lastName && (
              <Form.Text className="text-danger">{errors.lastName.message}</Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control type="text" {...register('fullName')} readOnly />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Photo (URL)</Form.Label>
            <Form.Control type="url" {...register('photo')} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" {...register('contactEmail')} />
            {errors.contactEmail && (
              <Form.Text className="text-danger">{errors.contactEmail.message}</Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control type="text" {...register('contactPhone')} />
            {errors.contactPhone && (
              <Form.Text className="text-danger">{errors.contactPhone.message}</Form.Text>
            )}
          </Form.Group>
        </Col>
        {/* 2️⃣ Professional Details */}
        <Col md={12}>
          <h5 className="mt-4 mb-3">Professional Details</h5>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>INAMI Number</Form.Label>
            <Form.Control type="text" {...register('inamiNumber')} />
            {errors.inamiNumber && (
              <Form.Text className="text-danger">{errors.inamiNumber.message}</Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>About Me</Form.Label>
            <Form.Control as="textarea" rows={3} {...register('aboutMe')} />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Consultations</Form.Label>
            <Form.Control as="textarea" rows={3} {...register('consultations')} />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Degrees & Training</Form.Label>
            <Form.Control as="textarea" rows={3} {...register('degreesTraining')} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Select {...register('departmentId')}>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          {' '}
          <Form.Group className="mb-3">
            {' '}
            <Form.Label>Specialization</Form.Label>{' '}
            <Form.Select {...register('specializationIds.0')}>
              {' '}
              <option value="">Select Specialization</option>{' '}
              {specializations.map((s) => (
                <option key={s.specialization_id} value={s.specialization_id}>
                  {' '}
                  {s.specialization_type}{' '}
                </option>
              ))}{' '}
            </Form.Select>{' '}
            {errors.specializationIds && (
              <Form.Text className="text-danger">
                {' '}
                {errors.specializationIds.message as string}{' '}
              </Form.Text>
            )}{' '}
          </Form.Group>{' '}
        </Col>

        {/* 3️⃣ Branch & Availability */}
        <Col md={12}>
          <h5 className="mt-4 mb-3">Branch & Availability</h5>
        </Col>
        <Col md={12}>
          {branchFields.map((branch, index) => (
            <div key={branch.id} className="border p-3 mb-3 rounded">
              <Form.Group className="mb-2">
                <Form.Label>Select Branch</Form.Label>
                <Form.Select {...register(`branches.${index}.branch_id` as const)}>
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <h6 className="mt-2">Availability</h6>
              <AvailabilitySlots
                nestIndex={index}
                control={control}
                register={register}
                errors={errors}
              />
              <Button
                variant="danger"
                size="sm"
                className="mt-2"
                onClick={() => removeBranch(index)}
              >
                Remove Branch
              </Button>
            </div>
          ))}
          <Button
            className="mt-2"
            onClick={() => appendBranch({ branch_id: 0, branch_name: '', availability: [] })}
          >
            Add Branch
          </Button>
          {errors.branches && (
            <Form.Text className="text-danger">{errors.branches.message as string}</Form.Text>
          )}
        </Col>
        {/* 4️⃣ Additional Info */}
        <Col md={12}>
          <h5 className="mt-4 mb-3">Additional Info</h5>
        </Col>
        <Col md={6}>
          {' '}
          <Form.Group className="mb-3">
            {' '}
            <Form.Label>Languages</Form.Label>{' '}
            <Form.Select {...register('languages')}>
              {' '}
              <option value="">Select Language</option> <option value="1">English</option>{' '}
              <option value="2">French</option> <option value="3">German</option>{' '}
            </Form.Select>{' '}
            {errors.languages && (
              <Form.Text className="text-danger">{errors.languages.message as string}</Form.Text>
            )}{' '}
          </Form.Group>{' '}
        </Col>

        <Col md={6}>
          {' '}
          <Form.Group className="mb-3">
            {' '}
            <Form.Label>Payment Method</Form.Label>{' '}
            <Form.Select {...register('paymentMethods')}>
              {' '}
              <option value="">Select Payment Method</option> <option value="cash">Cash</option>{' '}
              <option value="card">Card</option> <option value="upi">UPI</option>{' '}
              <option value="bank">Bank Transfer</option>{' '}
            </Form.Select>{' '}
            {errors.paymentMethods && (
              <Form.Text className="text-danger">{errors.paymentMethods.message}</Form.Text>
            )}{' '}
          </Form.Group>{' '}
        </Col>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>FAQ</Form.Label>
            <Form.Control as="textarea" rows={3} {...register('faq')} />
          </Form.Group>
        </Col>
        <Col md={12} className="text-end">
          <Button type="submit" variant="primary">
            Save Therapist
          </Button>
        </Col>
     
        </CardBody>
      </Card>
       </Row>
    </form>
  );
};

const AvailabilitySlots = ({ nestIndex, control, register, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `branches.${nestIndex}.availability`,
  });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <div>
      {fields.map((field, k) => (
        <Row key={field.id} className="align-items-end mb-2">
          <Col md={4}>
            <Form.Select {...register(`branches.${nestIndex}.availability.${k}.day` as const)}>
              <option value="">Select Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Form.Select>
            {errors?.branches?.[nestIndex]?.availability?.[k]?.day && (
              <Form.Text className="text-danger">
                {errors.branches[nestIndex].availability[k].day.message}
              </Form.Text>
            )}
          </Col>
          <Col md={3}>
            <Form.Control
              type="time"
              {...register(`branches.${nestIndex}.availability.${k}.startTime` as const)}
            />
            {errors?.branches?.[nestIndex]?.availability?.[k]?.startTime && (
              <Form.Text className="text-danger">
                {errors.branches[nestIndex].availability[k].startTime.message}
              </Form.Text>
            )}
          </Col>
          <Col md={3}>
            <Form.Control
              type="time"
              {...register(`branches.${nestIndex}.availability.${k}.endTime` as const)}
            />
            {errors?.branches?.[nestIndex]?.availability?.[k]?.endTime && (
              <Form.Text className="text-danger">
                {errors.branches[nestIndex].availability[k].endTime.message}
              </Form.Text>
            )}
          </Col>
          <Col md={2}>
            <Button variant="danger" size="sm" onClick={() => remove(k)}>
              Remove
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={() => append({ day: '', startTime: '', endTime: '' })}
      >
        Add Slot
      </Button>
    </div>
  );
};

export default TherapistForm;
