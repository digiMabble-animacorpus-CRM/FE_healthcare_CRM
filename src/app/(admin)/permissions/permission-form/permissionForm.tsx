'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';
import type { PermissionType } from '@/types/data';

// ✅ Form Values Type
interface PermissionFormValues {
  key: string;
  label: string;
  description?: string;
}

// ✅ Validation Schema
const schema = yup.object({
  key: yup.string().required('Key is required'),
  label: yup.string().required('Label is required'),
  description: yup.string().optional(),
});

interface Props {
  defaultValues?: Partial<PermissionType>;
  isEditMode?: boolean;
  onSubmitHandler: (data: PermissionFormValues & { _id?: string }) => Promise<void>;
}

const PermissionForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();

  const methods = useForm<PermissionFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      key: defaultValues?.key || '',
      label: defaultValues?.label || '',
      description: defaultValues?.description || '',
    },
  });

  const { handleSubmit, control } = methods;

  const handleFormSubmit = async (data: PermissionFormValues) => {
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
              {isEditMode
                ? 'Modifier les détails de l autorisation'
                : 'Créer une nouvelle autorisation'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <div className="mb-4">
              <h5 className="mb-3">Informations sur les autorisations</h5>
              <Row>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="key"
                      label="Entrer la clé"
                      placeholder="Ex : accès au tableau de bord"
                    />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="label"
                      label="Entrez l'étiquette"
                      placeholder="Ex : accès au tableau de bord"
                    />
                  </div>
                </Col>

                <Col lg={12}>
                  <div className="mb-3">
                    <TextFormInput
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Ex : Permet d’accéder aux pages du tableau de bord"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Mise à jour' : 'Créer'} Autorisation
              </Button>
              <Button variant="danger" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

export default PermissionForm;
