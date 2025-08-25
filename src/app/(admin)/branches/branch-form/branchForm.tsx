'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';

export interface BranchFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  location?: string;
}

const schema = yup.object({
  name: yup.string().required('Branch name is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().required('Address is required'),
  location: yup.string().optional(),
});

interface Props {
  defaultValues?: Partial<BranchFormValues & { _id?: string }>;
  isEditMode?: boolean;
  onSubmitHandler: (data: BranchFormValues & { _id?: string }) => Promise<void>;
}

const BranchForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();

  const methods = useForm<BranchFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      address: defaultValues?.address || '',
      location: defaultValues?.location || '',
    },
  });

  const { handleSubmit, control, register } = methods;

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
                  placeholder="Ex: Main Clinic"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="phone"
                  label="Phone"
                  placeholder="Ex: +1234567890"
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

              <Col lg={12}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Ex: 123 Health St, Wellness City"
                    {...register('address')}
                  />
                </Form.Group>
              </Col>

              <Col lg={12}>
                <TextFormInput
                  control={control}
                  name="location"
                  label="Google Location (Optional)"
                  placeholder="Ex: https://maps.google.com/?q=12.9716,77.5946"
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
