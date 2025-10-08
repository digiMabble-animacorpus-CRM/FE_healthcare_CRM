// /appointments/components/PatientInfoCard/index.tsx
'use client';

import { createPatient, findPatient, updatePatient } from '@/helpers/patient';
import type { PatientType } from '../types/appointment';
import { useState, useEffect } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import * as yup from 'yup';

const patientSchema = yup.object().shape({
  firstname: yup.string().required('Le prénom est obligatoire'),
  lastname: yup.string().required('Le nom de famille est obligatoire'),
  emails: yup
    .string()
    .email('Veuillez saisir une adresse e-mail valide')
    .required('L adresse e-mail est obligatoire'),
  phones: yup
    .array()
    .of(yup.string().required('Le numéro de téléphone est requis'))
    .min(1, 'Au moins un numéro de téléphone est requis'),
  birthdate: yup.date().nullable(),
  legalgender: yup.string().required('Le sexe est requis'),
  city: yup.string().required('La ville est obligatoire'),
  status: yup.string().required('Le statut est requis'),
  language: yup.string().required('La langue est requise'),
  country: yup.string().required('Le pays est requis'),
  zipcode: yup.string().required('Le code postal est requis'),
  street: yup.string().required('L adresse est requise'),
  note: yup.string(),
});

const emptyPatient: PatientType = {
  id: '',
  number: '',
  firstname: '',
  lastname: '',
  emails: '',
  phones: [],
  birthdate: '',
  legalgender: '',
  city: '',
  status: 'ACTIVE',
  language: '',
  country: '',
  zipcode: '',
  street: '',
  note: '',
  middlename: '',
  ssin: '',
  primarypatientrecordid: '',
  mutualitynumber: '',
  mutualityregistrationnumber: '',
  therapistId: null,
  created_at: '',
  is_delete: false,
  deleted_at: null,
};

interface PatientInfoCardProps {
  onSave?: (patient: PatientType) => void;
  onReset?: () => void;
  initialData?: PatientType;
  mode?: 'search' | 'view' | 'edit' | 'new';
}

const PatientInfoCard = ({
  onSave,
  onReset,
  initialData,
  mode: initialMode = 'search',
}: PatientInfoCardProps) => {
  const [formData, setFormData] = useState<PatientType>(emptyPatient);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'search' | 'view' | 'edit' | 'new'>(initialMode);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialMode === 'view') {
        setMode('view');
        onSave?.(initialData);
      }
    }
  }, [initialData, initialMode, onSave]);

  const handleReset = () => {
    setFormData(emptyPatient);
    setSearchTerm('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors({});
    setMode('search');
    onReset?.();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setErrorMsg('Please enter a search term');
      return;
    }
    setLoading(true);
    try {
      const result = await findPatient(searchTerm.trim());
      if (result) {
        setFormData(result);
        setMode('view');
        setErrorMsg(null);
        onSave?.(result);
      } else {
        setErrorMsg('Aucun patient trouvé. Essayez den ajouter un nouveau.');
        setFormData(emptyPatient);
        setMode('search');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'La recherche a échoué');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PatientType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = async () => {
    try {
      await patientSchema.validate(formData, { abortEarly: false });
      setValidationErrors({});
      return true;
    } catch (err: any) {
      const errors: Record<string, string> = {};
      if (yup.ValidationError.isError(err)) {
        err.inner.forEach((error: yup.ValidationError) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const isValid = await validateForm();
      if (!isValid) {
        setErrorMsg('Please fix the validation errors');
        setLoading(false);
        return;
      }

      if (formData.birthdate) {
        formData.birthdate = new Date(formData.birthdate).toISOString();
      }

      let ok = false;

      if (mode === 'edit' && formData.id) {
        ok = await updatePatient(formData.id, formData);
        if (ok) {
          setSuccessMsg('Patient updated successfully');
          setMode('view');
          onSave?.(formData);
        }
      } else if (mode === 'new') {
        ok = await createPatient(formData);
        if (ok) {
          setSuccessMsg('Patient created successfully');
          setMode('view');
          onSave?.(formData);
        }
      }

      if (!ok) setErrorMsg('Failed to save patient');
    } catch (err: any) {
      setErrorMsg(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="h4">
        <CardTitle as="h4" className="mb-0">
          Patient Details
        </CardTitle>
      </CardHeader>
      <CardBody>
        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {errorMsg}
            <button type="button" className="btn-close" onClick={() => setErrorMsg(null)}></button>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMsg}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMsg(null)}
            ></button>
          </div>
        )}

        {mode === 'search' && (
          <div className="mb-4">
            <div className="d-flex flex-column flex-md-row mb-3 gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search by E-mail, Phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : 'Search'}
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setFormData(emptyPatient);
                  setMode('new');
                }}
              >
                New Patient
              </Button>
            </div>
          </div>
        )}

        {mode === 'view' && (
          <div className="border p-4 rounded bg-light">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="text-primary">
                {formData.firstname} {formData.lastname}
              </h5>
              <Badge bg={formData.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {formData.status}
              </Badge>
            </div>

            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>E-mail:</strong> {formData.emails || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Phone:</strong>{' '}
                  {Array.isArray(formData.phones) && formData.phones.length > 0
                    ? formData.phones.join(', ')
                    : 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Gender:</strong> {formData.legalgender || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Language:</strong> {formData.language || 'N/A'}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>City:</strong> {formData.city || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Country:</strong> {formData.country || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Zip Code:</strong> {formData.zipcode || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Address:</strong> {formData.street || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>DOB:</strong>{' '}
                  {formData.birthdate ? new Date(formData.birthdate).toLocaleDateString() : 'N/A'}
                </div>
              </Col>
            </Row>

            {formData.note && (
              <div className="mt-3 p-3 bg-white rounded">
                <strong>Description:</strong>
                <p className="mb-0 mt-1">{formData.note}</p>
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <Button size="sm" onClick={() => setMode('edit')}>
                Modifier
              </Button>
              <Button size="sm" variant="outline-primary" onClick={handleReset}>
                Nouveau Recherche
              </Button>
            </div>
          </div>
        )}

        {(mode === 'edit' || mode === 'new') && (
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Prénom <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => handleChange('firstname', e.target.value)}
                    isInvalid={!!validationErrors.firstname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.firstname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Nom de famille <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => handleChange('lastname', e.target.value)}
                    isInvalid={!!validationErrors.lastname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.lastname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    E-mail <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.emails || ''}
                    onChange={(e) => handleChange('emails', e.target.value)}
                    isInvalid={!!validationErrors.emails}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.emails}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Phone Numbers (comma separated) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      Array.isArray(formData.phones)
                        ? formData.phones.join(', ')
                        : formData.phones || ''
                    }
                    onChange={(e) =>
                      handleChange(
                        'phones',
                        e.target.value.split(',').map((p) => p.trim()),
                      )
                    }
                    isInvalid={!!validationErrors.phones}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.phones}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Gender <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.legalgender || ''}
                    onChange={(e) => handleChange('legalgender', e.target.value)}
                    isInvalid={!!validationErrors.legalgender}
                  >
                    <option value="">Select</option>
                    <option value="M">Mâle</option>
                    <option value="F">Femelle</option>
                    <option value="O">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.legalgender}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.birthdate ? formData.birthdate.split('T')[0] : ''}
                    onChange={(e) => handleChange('birthdate', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Preferred Language <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.language || ''}
                    onChange={(e) => handleChange('language', e.target.value)}
                    isInvalid={!!validationErrors.language}
                  >
                    <option value="">Sélectionnez la langue</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="nl">Dutch</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.language}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Status <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    isInvalid={!!validationErrors.status}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.status}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Country <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    isInvalid={!!validationErrors.country}
                  >
                    <option value="">Select Country</option>
                    <option value="UK">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.country}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    City <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    isInvalid={!!validationErrors.city}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.city}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Zip Code <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.zipcode || ''}
                    onChange={(e) => handleChange('zipcode', e.target.value)}
                    isInvalid={!!validationErrors.zipcode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.zipcode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.street || ''}
                    onChange={(e) => handleChange('street', e.target.value)}
                    isInvalid={!!validationErrors.street}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.street}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.note || ''}
                onChange={(e) => handleChange('note', e.target.value)}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="primary" onClick={handleSave} disabled={loading}>
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : mode === 'edit' ? (
                  'Mettre à jour le patient'
                ) : (
                  'Ajouter un patient'
                )}
              </Button>
              <Button
                variant="danger"
                onClick={() => (mode === 'edit' ? setMode('view') : handleReset())}
              >
                Annuler
              </Button>
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default PatientInfoCard;
