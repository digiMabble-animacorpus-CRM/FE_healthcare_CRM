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
              {isEditMode ? 'Modifier la langue' : 'Créer une nouvelle langue'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <div className="mb-4">
              <h5 className="mb-3">Informations linguistiques</h5>
              <Row>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="key"
                      label="Entrer la clé"
                      placeholder="Ex: en-UK"
                    />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="label"
                      label="Entrez la langue"
                      placeholder="Ex: English (UK)"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Mise à jour' : 'Créer'} Langue
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

export default LanguageForm;
