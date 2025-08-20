'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';

// 📝 Form values type
interface LanguageFormValues {
  key: string;
  label: string;
}

// ✅ Validation Schema
const schema = yup.object({
  key: yup.string().required('Key is required'),
  label: yup.string().required('Language is required'),
});

interface Props {
  defaultValues?: Partial<LanguageFormValues>;
  isEditMode?: boolean;
  onSubmitHandler: (data: LanguageFormValues & { _id?: string }) => Promise<void>;
}

const LanguageForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();

  const methods = useForm<LanguageFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      key: defaultValues?.key || '',
      label: defaultValues?.label || '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // ✅ Merge _id only in edit mode
  const handleFormSubmit = async (data: LanguageFormValues) => {
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
              {isEditMode ? 'Edit Language Details' : 'Create New Language'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <div className="mb-4">
              <h5 className="mb-3">Language Information</h5>
              <Row>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="key"
                      label="Enter Key"
                      placeholder="Ex: en-US"
                    />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="label"
                      label="Enter Language"
                      placeholder="Ex: English (US)"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Update' : 'Create'} Language
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

export default LanguageForm;
