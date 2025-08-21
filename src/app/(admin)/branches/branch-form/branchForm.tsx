'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';

interface Address {
  street: string;
  line2?: string;
  city: string;
  zip_code: string;
  country: string;
}

export interface BranchFormValues {
  name: string;
  code: string;
  email: string;
  phoneNumber: string;
  address: Address;
}

const schema = yup.object({
  name: yup.string().required('Branch name is required'),
  code: yup.string().required('Branch code is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.object({
    street: yup.string().required('Address Line 1 is required'),
    line2: yup.string(),
    city: yup.string().required('City is required'),
    zip_code: yup.string().required('Zip Code is required'),
    country: yup.string().required('Country is required'),
  }),
});

interface Props {
  defaultValues?: Partial<BranchFormValues>;
  isEditMode?: boolean;
  onSubmitHandler: (data: BranchFormValues & { _id?: string }) => Promise<void>;
}

const BranchForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();

  const methods = useForm<BranchFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      code: defaultValues?.code || '',
      email: defaultValues?.email || '',
      phoneNumber: defaultValues?.phoneNumber || '',
      address: defaultValues?.address || {
        street: '',
        line2: '',
        city: '',
        zip_code: '',
        country: '',
      },
    },
  });

  const { handleSubmit, control } = methods;

  const handleFormSubmit = async (data: BranchFormValues) => {
    const payload =
      isEditMode && (defaultValues as any)?._id
        ? { ...data, _id: (defaultValues as any)._id }
        : data;

    await onSubmitHandler(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode ? 'Edit Branch Details' : 'Create New Branch'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <Row className="mb-4">
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="name"
                  label="Branch Name"
                  placeholder="Ex: Bangalore Main Branch"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="code"
                  label="Branch Code"
                  placeholder="Ex: BLR-MAIN"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="Ex: branch@example.com"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="Ex: +91 9876543210"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="address.street"
                  label="Address Line 1"
                  placeholder="Ex: 123 MG Road"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="address.line2"
                  label="Address Line 2 (Optional)"
                  placeholder="Ex: Near Park"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="address.city"
                  label="City"
                  placeholder="Ex: Bangalore"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="address.zip_code"
                  label="Zip Code"
                  placeholder="Ex: 560001"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="address.country"
                  label="Country"
                  placeholder="Ex: India"
                />
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Update' : 'Create'} Branch
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

export default BranchForm;
