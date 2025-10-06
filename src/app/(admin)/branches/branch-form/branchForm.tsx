'use client';

import { FormProvider, useForm } from 'react-hook-form';
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
  Alert,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';
import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import { useState } from 'react';

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
  email: yup.string().email('Invalid email').required('E-mail is required'),
  address: yup.string().required('Address is required'),
  location: yup.string().optional(),
});

interface Props {
  defaultValues?: Partial<BranchFormValues & { branch_id?: string }>;
  isEditMode?: boolean;
}

const BranchForm = ({ defaultValues, isEditMode = false }: Props) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    try {
      setSubmitting(true);
      setMessage(null);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      if (isEditMode && defaultValues?.branch_id) {
        // UPDATE branch (no branch_id in body, only in URL)
        await axios.patch(`${API_BASE_PATH}/branches/${defaultValues.branch_id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setMessage({ type: 'success', text: 'Succursale mise à jour avec succès.' });
      } else {
        // CREATE branch
        await axios.post(`${API_BASE_PATH}/branches`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setMessage({ type: 'success', text: 'Succursale créée avec succès.' });
      }

      setTimeout(() => router.push('/branches'), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode ? 'Modifier les détails de la succursale' : 'Créer une nouvelle branche'}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {message && (
              <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                {message.text}
              </Alert>
            )}

            <Row className="mb-4">
              <Col lg={6} className="mb-3">
                <TextFormInput
                  required
                  control={control}
                  name="name"
                  label="Nom de la succursale"
                  placeholder="Ex: Namur"
                />
              </Col>
              <Col lg={6} className="mb-3">
                <TextFormInput
                  required
                  control={control}
                  name="phone"
                  label="Téléphone"
                  placeholder="Ex: +32467850000"
                />
              </Col>
              <Col lg={6} className="mb-3">
                <TextFormInput
                  required
                  control={control}
                  name="email"
                  label="E-mail"
                  placeholder="Ex: branch@example.com"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="location"
                  label="Localisation Google (facultatif)"
                  placeholder="Ex: https://maps.google.com/?q=12.9716,77.5946"
                />
              </Col>
              <Col lg={12}>
                <Form.Group>
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Ex: Rue du avenue"
                    {...register('address')}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    En cours...
                  </>
                ) : isEditMode ? (
                  'Mise à jour Succursale'
                ) : (
                  'Créer Succursale'
                )}
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

export default BranchForm;
