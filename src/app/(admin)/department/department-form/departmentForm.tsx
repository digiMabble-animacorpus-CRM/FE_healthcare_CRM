'use client';

import TextFormInput from '@/components/from/TextFormInput';
import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
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
  // const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
 const { showNotification } = useNotificationContext();
  const methods = useForm<DepartmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const { handleSubmit, control, register } = methods;
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
          // ✅ UPDATE department
          await axios.put(`${API_BASE_PATH}/departments/${(defaultValues as any)._id}`, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          showNotification({
            message: 'Département mis à jour avec succès !',
            variant: 'success',
          });
        } else {
          // ✅ CREATE department
          await axios.post(`${API_BASE_PATH}/departments`, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          showNotification({
            message: 'Département créé avec succès !',
            variant: 'success',
          });
        }

        // redirect after short delay
        setTimeout(() => {
          router.push('/department');
        }, 2000);
      } catch (err) {
        console.error('Error saving department:', err);

        showNotification({
          message: 'Échec de l’enregistrement du département.',
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
              {isEditMode ? 'Modifier les détails du service' : 'Créer un nouveau département'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            {/* {message && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: message.type === 'success' ? '#0f5132' : '#842029',
                  backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
                  border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`,
                }}
              >
                {message.text}
              </div>
            )} */}

            <Row className="mb-4">
              <Col lg={6} className="mb-3">
                <TextFormInput
                  required
                  control={control}
                  name="name"
                  label="Nom du département"
                  placeholder="Entrez le nom du département"
                />
              </Col>

              <Col lg={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Entrez la description du département"
                    {...register('description')}
                  />
                </Form.Group>
              </Col>

              {/* Hidden is_active field */}
              <input type="hidden" {...register('is_active')} />
            </Row>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Mise à jour' : 'Créer'} Département
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

export default DepartmentForm;
