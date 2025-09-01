'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';

export interface DepartmentFormValues {
  name: string;
  description?: string;
  is_active: boolean;
}

const schema = yup.object({
  name: yup.string().required('Department name is required'),
  description: yup.string(),
  is_active: yup.boolean().default(true),
});

interface Props {
  defaultValues?: Partial<DepartmentFormValues & { _id?: string }>;
  isEditMode?: boolean;
  onSubmitHandler: (data: DepartmentFormValues & { _id?: string }) => Promise<void>;
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

  const handleFormSubmit = async (data: DepartmentFormValues) => {
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
