'use client';

import { FormProvider, useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Form,
  Spinner,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';
import { useState, useEffect } from 'react';

export interface DepartmentOption {
  id: number;
  name: string;
}

export interface SpecializationFormValues {
  department_id: number;
  specialization_type: string;
  description?: string;
  is_active: boolean;
}

const schema = yup.object({
  department_id: yup
    .number()
    .typeError('Department is required')
    .required('Department is required'),
  specialization_type: yup.string().required('Specialization type is required'),
  description: yup.string().optional(),
  is_active: yup.boolean().default(true),
});

interface Props {
  defaultValues?: Partial<SpecializationFormValues & { _id?: string }>;
  isEditMode?: boolean;
  onSubmitHandler?: (data: SpecializationFormValues) => void;
}

const SpecializationForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const methods = useForm<SpecializationFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      department_id: defaultValues?.department_id || 0,
      specialization_type: defaultValues?.specialization_type || '',
      description: defaultValues?.description || '',
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const { handleSubmit, control, register } = methods;

  // Fetch department list
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_PATH}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched departments:', response.data);
        setDepartments(response.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleFormSubmit = onSubmitHandler
    ? onSubmitHandler
    : async (data: SpecializationFormValues) => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            console.warn('No access token found');
            return;
          }

          if (isEditMode && (defaultValues as any)?._id) {
            const res = await axios.patch(
              `${API_BASE_PATH}/specializations/${(defaultValues as any)._id}`,
              data,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            console.log('Specialization updated:', res.data);
            setMessage({ type: 'success', text: 'Spécialisation mise à jour avec succès !' });
          } else {
            const res = await axios.post(`${API_BASE_PATH}/specializations`, data, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            console.log('Created specialization:', res.data);

            setMessage({ type: 'success', text: 'Spécialisation créée avec succès !' });
          }

          setTimeout(() => {
            setMessage(null);
            router.push('/specialization');
          }, 2000);
        } catch (err) {
          console.log('Error saving specialization:', err);
          setMessage({ type: 'error', text: 'Échec de l’enregistrement de la spécialisation.' });

          setTimeout(() => setMessage(null), 3000);
        }
      };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode
                ? 'Modifier les détails de la spécialisation'
                : 'Créer une nouvelle spécialisation'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            {message && (
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
            )}

            <Row className="mb-4">
              <Col lg={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Département</Form.Label>
                  <Controller
                    control={control}
                    name="department_id"
                    render={({ field, fieldState }) => (
                      <>
                        <Form.Select {...field} disabled={loadingDepartments}>
                          <option value="">-- Sélectionner un département --</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </Form.Select>
                        {loadingDepartments && (
                          <div className="mt-1">
                            <Spinner size="sm" animation="border" />
                          </div>
                        )}
                        {fieldState.error && (
                          <div className="text-danger mt-1">{fieldState.error.message}</div>
                        )}
                      </>
                    )}
                  />
                </Form.Group>
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Type de spécialisation</Form.Label>
                  <Controller
                    control={control}
                    name="specialization_type"
                    render={({ field, fieldState }) => (
                      <>
                        <Form.Select {...field}>
                          <option value="">-- Sélectionner un type --</option>
                          <option value="Consultation">Consultation</option>
                          <option value="Operation">Opération</option>
                          <option value="Other">Autre</option>
                        </Form.Select>
                        {fieldState.error && (
                          <div className="text-danger mt-1">{fieldState.error.message}</div>
                        )}
                      </>
                    )}
                  />
                </Form.Group>
              </Col>

              <Col lg={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Entrez la description de la spécialisation"
                    {...register('description')}
                  />
                </Form.Group>
              </Col>

              <input type="hidden" {...register('is_active')} />
            </Row>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Mise à jour' : 'Créer'} Spécialisation
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

export default SpecializationForm;
