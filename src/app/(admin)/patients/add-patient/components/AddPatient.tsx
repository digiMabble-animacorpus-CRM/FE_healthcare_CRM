'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

interface Props {
  params?: { id?: string };
  onSubmitHandler?: (data: PatientType) => void;
}

const schema: yup.ObjectSchema<Partial<PatientType>> = yup
  .object({
    firstname: yup.string().required('Please enter first name'),
    lastname: yup.string().required('Please enter last name'),
    middlename: yup.string(),
    emails: yup.string().email('Invalid email').required('Please enter email'),
    number: yup
      .string()
      .matches(/^\d{10}$/, 'Enter valid 10-digit number')
      .required('Please enter number'),
    phones: yup.array().of(yup.string()),
    birthdate: yup.string().required('Please enter Date of birth'),
    street: yup.string().required('Please enter address'),
    note: yup.string().required('Please enter description'),
    zipcode: yup.string(),
    legalgender: yup.string().required('Please select gender'),
    language: yup.string().required('Please select language'),
    city: yup.string().required('Please select city'),
    country: yup.string().required('Please select country'),
    ssin: yup.string(),
    status: yup.string(),
    mutualitynumber: yup.string(),
    mutualityregistrationnumber: yup.string(),
    branch: yup.string(),
    tags: yup.array().of(yup.string()).min(1, 'Please select at least one tag'),
  })
  .required()
  .noUnknown(true);

const AddPatient = ({ params, onSubmitHandler }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [defaultValues, setDefaultValues] = useState<Partial<PatientType>>({
    createdAt: '',
    _id: '',
    birthdate: '',
    city: '',
    country: '',
    emails: '',
    firstname: '',
    id: '',
    language: '',
    lastname: '',
    legalgender: '',
    middlename: '',
    mutualitynumber: '',
    mutualityregistrationnumber: '',
    note: '',
    number: '',
    phones: [''],
    primarypatientrecordid: '',
    ssin: '',
    status: '',
    street: '',
    zipcode: '',
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
  } = useForm<Partial<PatientType>>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Fetch patient for edit mode
  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getPatientById(params.id)
        .then((response) => {
          console.log(response);
          const patient: PatientType = response; // directly use data as object

          if (patient) {
            console.log(patient);

            // Map API response properly for form
            const mappedPatient: Partial<PatientType> = {
              ...patient,
              number: patient.number || (patient.phones?.[0] ?? ''),
              street: patient.street || '',
              middlename: patient.middlename || '',
              note: patient.note || '',
              emails: patient.emails || '',
            };

            setDefaultValues(mappedPatient);
            reset(mappedPatient);
          }
        })
        .catch((error) => console.error('Failed to fetch patient:', error))
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const onSubmit = async (data: Partial<PatientType>) => {
    if (isEditMode && params?.id) {
      const success = await updatePatient(params.id, data as any);
      if (success) {
        alert('Patient updated successfully');
        router.back();
      } else {
        alert('Failed to update patient');
      }
    } else {
      const success = await createPatient(data as any);
      if (success) {
        alert('Patient created successfully');
        reset(); // clear the form
      } else {
        alert('Failed to create patient');
      }
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
      <Card>
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Edit Patient' : 'Add Patient'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="firstname"
                label="First Name"
                placeholder="Enter First Name"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="lastname"
                label="Last Name"
                placeholder="Enter Last Name"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="middlename"
                label="Middle Name"
                placeholder="Enter Middle Name"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="emails"
                label="Email"
                placeholder="Enter Email"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="number"
                label="Phone Number"
                placeholder="Enter Phone Number"
                type="number"
              />
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
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </ChoicesFormInput>
                )}
              />
              {errors.legalgender && (
                <small className="text-danger">{errors.legalgender.message}</small>
              )}
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
              <TextAreaFormInput
                control={control}
                name="street"
                label="Address"
                placeholder="Enter Address"
                rows={3}
              />
            </Col>
            <Col lg={6}>
              <TextAreaFormInput
                control={control}
                name="note"
                label="Description"
                placeholder="Enter Description"
                rows={3}
              />
            </Col>

            <Col lg={4}>
              <TextFormInput
                control={control}
                name="zipcode"
                label="Zip-Code"
                placeholder="Enter Zip-Code"
                type="number"
              />
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
                    <option value="London">London</option>
                    <option value="Paris">Paris</option>
                    <option value="New York">New York</option>
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
              <TextFormInput
                control={control}
                name="mutualitynumber"
                label="Mutuality Number"
                placeholder="Enter Mutuality Number"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="mutualityregistrationnumber"
                label="Mutuality Registration Number"
                placeholder="Enter Mutuality Registration Number"
              />
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
