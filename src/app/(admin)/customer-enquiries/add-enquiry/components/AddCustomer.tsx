'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';

import { useRouter } from 'next/navigation';

import { getCustomerEnquiriesById } from '@/helpers/data';
import type { BranchType, CustomerEnquiriesType, LanguageType } from '@/types/data';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import { getAllLanguages } from '@/helpers/languages';
import { getAllBranch } from '@/helpers/branch';

type CustomerFormValues = {
  name: string;
  email: string;
  number: string;
  dob: string;
  description: string;
  address: string;
  zip_code: string;
  gender: string;
  language: string;
  branch: string;
  tags: string[];
  city: string;
  country: string;
};

const schema: yup.ObjectSchema<CustomerFormValues> = yup.object({
  name: yup.string().required('Please enter name'),
  email: yup.string().email('Invalid email').required('Please enter email'),
  number: yup
    .string()
    .matches(/^\d{10}$/, 'Enter valid 10-digit number')
    .required('Please enter number'),
  dob: yup.string().required('Please enter Date of birth'),
  address: yup.string().required('Please enter address'),
  description: yup.string().required('Please enter description'),
  zip_code: yup
    .string()
    .matches(/^\d{5}$/, 'Enter valid Zip-Code')
    .required('Please enter Zip-Code'),
  gender: yup.string().required('Please select gender'),
  branch: yup.string().required('Please select branch'),
  language: yup.string().required('Please select language'),
  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Please select at least one tag')
    .required('Please select tags'),
  city: yup.string().required('Please select city'),
  country: yup.string().required('Please select country'),
});

interface Props {
  params: { id?: string };
  onSubmitHandler?: (data: CustomerEnquiriesType) => void;
}

const AddCustomer = ({ params, onSubmitHandler }: Props) => {
  const router = useRouter();
  const isEditMode = !!params.id;

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [defaultValues, setDefaultValues] = useState<CustomerFormValues>({
    name: '',
    email: '',
    number: '',
    dob: '',
    description: '',
    address: '',
    zip_code: '',
    gender: '',
    language: '',
    branch: '',
    tags: [],
    city: '',
    country: '',
  });

  const allLanguages = useMemo<LanguageType[]>(() => getAllLanguages(), []);
  const allBranches = useMemo<BranchType[]>(() => getAllBranch(), []);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const response = await getCustomerEnquiriesById(params.id!);
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            const enquiries: CustomerEnquiriesType = data[0];
            setDefaultValues(enquiries as CustomerFormValues);
            reset(enquiries as CustomerFormValues);
          } else {
            console.error('Customer not found or invalid data format');
          }
        } catch (error) {
          console.error('Failed to fetch customer:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isEditMode, params.id, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    if (onSubmitHandler) {
      onSubmitHandler(data as CustomerEnquiriesType);
      return;
    }

    if (isEditMode) {
      console.log('Edit Submitted Data:', data);
      // TODO: Update API call here
    } else {
      console.log('Create Submitted Data:', data);
      // TODO: Create API call here
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Edit Customer' : 'Add Customer'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="name"
                placeholder="Full Name"
                label="Customer Name"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="email"
                placeholder="Enter Email"
                label="Customer Email"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="number"
                type="number"
                placeholder="Enter Number"
                label="Customer Number"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="dob"
                type="date"
                placeholder=""
                label="Date of Birth"
              />
            </Col>

            <Col lg={6}>
              <label className="form-label">Gender</label>
              <Controller
                control={control}
                name="gender"
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
              {errors.gender && <small className="text-danger">{errors.gender.message}</small>}
            </Col>

            <Col lg={6}>
              <label className="form-label">Preferred Language</label>
              <Controller
                control={control}
                name="language"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select Preferred Language
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
              <label className="form-label">Tags</label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <ChoicesFormInput
                    className="form-control"
                    multiple
                    options={{ removeItemButton: true }}
                    {...field}
                  >
                    <option value="Blog">Blog</option>
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                    <option value="Computer Software">Computer Software</option>
                    <option value="Lifestyle blogs">Lifestyle blogs</option>
                    <option value="Fashion">Fashion</option>
                  </ChoicesFormInput>
                )}
              />
              {errors.tags && <small className="text-danger">{errors.tags.message}</small>}
            </Col>

            <Col lg={6}>
              <label className="form-label">Branch</label>
              <Controller
                control={control}
                name="branch"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Select Branch
                    </option>
                    {allBranches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </ChoicesFormInput>
                )}
              />
              {errors.branch && <small className="text-danger">{errors.branch.message}</small>}
            </Col>

            <Col lg={6}>
              <TextAreaFormInput
                control={control}
                name="address"
                label="Customer Address"
                rows={3}
                placeholder="Enter address"
              />
            </Col>

            <Col lg={6}>
              <TextAreaFormInput
                control={control}
                name="description"
                label="Description"
                rows={3}
                placeholder="Any Description"
              />
            </Col>

            <Col lg={4}>
              <TextFormInput
                control={control}
                name="zip_code"
                type="number"
                placeholder="Zip-Code"
                label="Zip-Code"
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
                      Choose a city
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
                      Choose a country
                    </option>
                    <option value="UK">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="IN">India</option>
                  </ChoicesFormInput>
                )}
              />
              {errors.country && <small className="text-danger">{errors.country.message}</small>}
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2 mt-2">
          <Col lg={2}>
            <Button variant="outline-primary" type="submit" className="w-100">
              {isEditMode ? 'Update' : 'Create'} Customer
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

export default AddCustomer;
