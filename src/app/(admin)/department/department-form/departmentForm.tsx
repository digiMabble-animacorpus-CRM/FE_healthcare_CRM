'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';

export interface DepartmentFormValues {
  name: string;
  description?: string;
  is_active: boolean;
}

const schema = yup.object({
  name: yup.string().required('Department name is required'),
  description: yup.string().optional(),
  is_active: yup.boolean().default(true),
});

interface Props {
  defaultValues?: Partial<DepartmentFormValues & { _id?: string }>;
  isEditMode?: boolean;
  onSubmitHandler?: (data: DepartmentFormValues) => void;
}

const DepartmentForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();

  const methods = useForm<DepartmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      is_active: defaultValues?.is_active ?? true, // default true
    },
  });

  const { handleSubmit, control, register } = methods;

  // Use the passed onSubmitHandler if provided, otherwise use the internal one
  const handleFormSubmit = onSubmitHandler
    ? onSubmitHandler
    : async (data: DepartmentFormValues) => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            console.warn('No access token found');
            return;
          }

          if (isEditMode && (defaultValues as any)?._id) {
            // PUT request for update
            await axios.put(
              `${API_BASE_PATH}/departments/${(defaultValues as any)._id}`,
              data,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          } else {
            // POST request for create
            await axios.post(`${API_BASE_PATH}/departments`, data, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          }

          router.push('/department'); // redirect after success
        } catch (err) {
          console.error('Error saving department:', err);
        }
      };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode ? 'Edit Department Details' : 'Create New Department'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <Row className="mb-4">
              <Col lg={6}>
                <TextFormInput
                  required
                  control={control}
                  name="name"
                  label="Department Name"
                  placeholder="Ex: Department Name"
                />
              </Col>

              <Col lg={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Ex: Department Description"
                    {...register('description')}
                  />
                </Form.Group>
              </Col>

              {/* Hidden is_active field */}
              <input type="hidden" {...register('is_active')} />
            </Row>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Update' : 'Create'} Department
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

export default DepartmentForm;