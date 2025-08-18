'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

import type { BranchType, LanguageType, PatientType } from '@/types/data';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import { getAllLanguages } from '@/helpers/languages';
import { getAllBranch } from '@/helpers/branch';
import { createPatient, getPatientById, updatePatient } from '@/helpers/patient';

// --- Types ---
type AddPatientFormValues = {
  firstname: string;
  lastname: string;
  middlename?: string;
  emails: string;
  number: string;
  phones?: string[];
  birthdate: string;
  street: string;
  note: string;
  zipcode?: string;
  legalgender: string;
  language: string;
  city: string;
  country: string;
  ssin?: string;
  status?: string;
  mutualitynumber?: string;
  mutualityregistrationnumber?: string;
  branch?: string;
  tags?: string[];
};

const schema: yup.ObjectSchema<AddPatientFormValues> = yup
  .object({
    firstname: yup.string().required('Please enter first name'),
    lastname: yup.string().required('Please enter last name'),
    middlename: yup.string().optional(),
    emails: yup.string().email('Invalid email').required('Please enter email'),
    number: yup.string().matches(/^\d{10}$/, 'Enter valid 10-digit number').required('Please enter number'),
    phones: yup.array().of(yup.string().required()).optional(),
    birthdate: yup.string().required('Please enter Date of birth'),
    street: yup.string().required('Please enter address'),
    note: yup.string().required('Please enter description'),
    zipcode: yup.string().optional(),
    legalgender: yup.string().required('Please select gender'),
    language: yup.string().required('Please select language'),
    city: yup.string().required('Please select city'),
    country: yup.string().required('Please select country'),
    ssin: yup.string().optional(),
    status: yup.string().optional(),
    mutualitynumber: yup.string().optional(),
    mutualityregistrationnumber: yup.string().optional(),
    branch: yup.string().optional(),
    tags: yup.array().of(yup.string().required()).min(1, 'Please select at least one tag').optional(),
  })
  .required()
  .noUnknown(true);

interface Props {
  params?: { id?: string };
}

const AddPatient = ({ params }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;

  const [loading, setLoading] = useState<boolean>(isEditMode);

  const [defaultValues, setDefaultValues] = useState<AddPatientFormValues>({
    firstname: '',
    lastname: '',
    middlename: '',
    emails: '',
    number: '',
    phones: [''],
    birthdate: '',
    street: '',
    note: '',
    zipcode: '',
    legalgender: '',
    language: '',
    city: '',
    country: '',
    ssin: '',
    status: '',
    mutualitynumber: '',
    mutualityregistrationnumber: '',
    branch: '',
    tags: [],
  });

  const allLanguages = useMemo<LanguageType[]>(() => getAllLanguages(), []);
  const allBranches = useMemo<BranchType[]>(() => getAllBranch(), []);
  const allTags = useMemo<string[]>(() => ['VIP', 'Regular', 'New', 'Follow-up'], []);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddPatientFormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Log when defaultValues change (for debugging)
  useEffect(() => {
    console.log('Default values set:', defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getPatientById(params.id)
        .then((patient: PatientType | null) => {
          console.log('Fetched patient for edit:', patient);
          if (patient) {
            const loadedValues: AddPatientFormValues = {
              firstname: patient.firstname || '',
              lastname: patient.lastname || '',
              middlename: patient.middlename || '',
              emails: patient.emails || '',
              number: patient.number || (patient.phones?.[0] ?? ''),
              phones: patient.phones || [''],
              birthdate: patient.birthdate || '',
              street: patient.street || '',
              note: patient.note || '',
              zipcode: patient.zipcode || '',
              legalgender: patient.legalgender || '',
              language: patient.language || '',
              city: patient.city || '',
              country: patient.country || '',
              ssin: patient.ssin || '',
              status: patient.status || '',
              mutualitynumber: patient.mutualitynumber || '',
              mutualityregistrationnumber: patient.mutualityregistrationnumber || '',
              branch: patient.branch || '',
              tags: [], // adjust if your API supports
            };
            setDefaultValues(loadedValues);
            reset(loadedValues);
          }
        })
        .catch((err) => {
          console.error('Error loading patient:', err);
          alert('Failed to load patient');
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const onSubmit: SubmitHandler<AddPatientFormValues> = async (data) => {
    console.log('Form submission data:', data);

    const payload = {
      firstname: data.firstname,
      middlename: data.middlename,
      lastname: data.lastname,
      ssin: data.ssin,
      legalgender: data.legalgender,
      language: data.language,
      primarypatientrecordid: "primary_record_123",
      note: data.note,
      status: data.status,
      mutualitynumber: data.mutualitynumber,
      mutualityregistrationnumber: data.mutualityregistrationnumber,
      emails: data.emails,
      country: data.country,
      city: data.city,
      street: data.street,
      number: data.number,
      zipcode: data.zipcode,
      birthdate: data.birthdate,
      phones: data.phones?.length ? data.phones : [data.number ?? ""],
      tags: data.tags,
      branch: data.branch,
    };

    console.log('Payload to be sent:', payload);

    let success = false;
    if (isEditMode && params?.id) {
      success = await updatePatient(params.id, payload);
      console.log('Update patient API success:', success);
      if (success) {
        alert('Patient updated successfully');
        router.back();
      }
    } else {
      success = await createPatient(payload);
      console.log('Create patient API success:', success);
      if (success) {
        alert('Patient created successfully');
        reset();
      }
    }
    if (!success) {
      alert('Failed to submit patient.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Log form errors for debugging
  useEffect(() => {
    if (Object.keys(errors).length) {
      console.warn('Form validation errors:', errors);
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Edit Patient' : 'Add Patient'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <TextFormInput control={control} name="firstname" label="First Name" placeholder="Enter First Name" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="lastname" label="Last Name" placeholder="Enter Last Name" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="middlename" label="Middle Name" placeholder="Enter Middle Name" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="emails" label="Email" placeholder="Enter Email" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="number" label="Phone Number" placeholder="Enter Phone Number" type="number" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="birthdate" label="Date of Birth" type="date" />
            </Col>
            <Col lg={6}>
              <label className="form-label">Gender</label>
              <Controller
                control={control}
                name="legalgender"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select Gender
                    </option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Others</option>
                  </ChoicesFormInput>
                )}
              />
              {errors.legalgender && <small className="text-danger">{errors.legalgender.message}</small>}
            </Col>
            <Col lg={6}>
              <label className="form-label">Language</label>
              <Controller
                control={control}
                name="language"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select Language
                    </option>
                    {allLanguages.map((lang) => (
                      <option key={lang.key} value={lang.key}>
                        {lang.label}
                      </option>
                    ))}
                  </ChoicesFormInput>
                )}
              />
              {errors.language && <small className="text-danger">{errors.language.message}</small>}
            </Col>
            <Col lg={6}>
              <TextAreaFormInput control={control} name="street" label="Address" placeholder="Enter Address" rows={3} />
            </Col>
            <Col lg={6}>
              <TextAreaFormInput control={control} name="note" label="Description" placeholder="Enter Description" rows={3} />
            </Col>
            <Col lg={4}>
              <TextFormInput control={control} name="zipcode" label="Zip-Code" placeholder="Enter Zip-Code" type="number" />
            </Col>
            <Col lg={4}>
              <label className="form-label">City</label>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select City
                    </option>
                    <option value="Brussels">Brussels</option>
                    <option value="London">London</option>
                    <option value="Paris">Paris</option>
                  </ChoicesFormInput>
                )}
              />
              {errors.city && <small className="text-danger">{errors.city.message}</small>}
            </Col>
            <Col lg={4}>
              <label className="form-label">Country</label>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select Country
                    </option>
                    <option value="BE">Belgium</option>
                    <option value="UK">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="IN">India</option>
                  </ChoicesFormInput>
                )}
              />
              {errors.country && <small className="text-danger">{errors.country.message}</small>}
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="ssin" label="SSIN" placeholder="Enter SSIN" />
            </Col>
            <Col lg={6}>
              <label className="form-label">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select Status
                    </option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </ChoicesFormInput>
                )}
              />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="mutualitynumber" label="Mutuality Number" placeholder="Enter Mutuality Number" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="mutualityregistrationnumber" label="Mutuality Registration Number" placeholder="Enter Mutuality Registration Number" />
            </Col>
            <Col lg={6}>
              <label className="form-label">Tags</label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <ChoicesFormInput multiple className="form-control" {...field}>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </ChoicesFormInput>
                )}
              />
              {errors.tags && <small className="text-danger">{errors.tags.message}</small>}
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2 mt-2">
          <Col lg={2}>
            <Button variant="outline-primary" type="submit" className="w-100">
              {isEditMode ? 'Update' : 'Create'} Patient
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="danger" className="w-100" onClick={() => router.back()}>
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  );
};

export default AddPatient;
