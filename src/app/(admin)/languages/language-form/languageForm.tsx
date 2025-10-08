'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNotificationContext } from '@/context/useNotificationContext';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TextFormInput from '@/components/from/TextFormInput';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';


export interface LanguageFormValues {
  key: string;
  label: string;
  is_active: boolean;
}

const schema = yup.object({
  key: yup.string().required('Key is required'),
  label: yup.string().required('Language is required'),
  is_active: yup.boolean().default(true),
});

interface Props {
  defaultValues?: Partial<LanguageFormValues & { _id?: string }>;
  isEditMode?: boolean;
  onSubmitHandler?: (data: LanguageFormValues) => void;
}

const LanguageForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();
 const { showNotification } = useNotificationContext();
  const methods = useForm<LanguageFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      key: defaultValues?.key || '',
      label: defaultValues?.label || '',
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const { handleSubmit, control, reset } = methods;

  /**
   * Reset form whenever defaultValues change
   */
  useEffect(() => {
    if (defaultValues) {
      reset({
        key: defaultValues.key || '',
        label: defaultValues.label || '',
        is_active: defaultValues.is_active ?? true,
      });
    }
  }, [defaultValues, reset]);

  /**
   * Handle form submit
   * - Uses onSubmitHandler if provided by parent
   * - Otherwise performs API call internally
   */
  const handleFormSubmit = onSubmitHandler
  ? onSubmitHandler
  : async (data: LanguageFormValues) => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('No access token found');
          return;
        }

        if (isEditMode && defaultValues?._id) {
          // ✅ UPDATE existing language
          await axios.patch(
            `${API_BASE_PATH}/languages/${defaultValues._id}`,
            {
              language_name: data.key,
              language_description: data.label,
              is_active: data.is_active,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          showNotification({
            message: 'Language mis à jour avec succès',
            variant: 'success',
          });
        } else {
          // ✅ CREATE new language
          await axios.post(
            `${API_BASE_PATH}/languages`,
            {
              language_name: data.key,
              language_description: data.label,
              is_active: data.is_active,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          showNotification({
            message: 'Language créé avec succès',
            variant: 'success',
          });
        }

        // redirect after short delay
        setTimeout(() => {
          router.push('/languages');
        }, 1500);
      } catch (err) {
        console.error('Error saving language:', err);

        showNotification({
          message: 'Échec de la sauvegarde language',
          variant: 'danger',
        });
      }
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

export default LanguageForm;
