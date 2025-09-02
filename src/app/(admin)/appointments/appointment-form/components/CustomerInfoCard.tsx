'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { createPatient, updatePatient, findPatient } from '@/helpers/patient';
import type { PatientType } from '@/types/data';

const emptyPatient: PatientType = {
  id: '',
  number: '',        // required field
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
  street: '',        // required field
  note: '',
};

interface CustomerInfoCardProps {
  onSave?: (patient: PatientType) => void;
}

const CustomerInfoCard = ({ onSave }: CustomerInfoCardProps) => {
  const [formData, setFormData] = useState<PatientType>(emptyPatient);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mode, setMode] = useState<'search' | 'view' | 'edit' | 'new'>('search');

  // 🔍 Handle search
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
        onSave?.(result); // also send to parent
      } else {
        setErrorMsg('No patient found. Try adding new.');
        setFormData(emptyPatient);
        setMode('search');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Handle form change
  const handleChange = (field: keyof PatientType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 💾 Save / Update
  const handleSave = async () => {
    setLoading(true);
    try {
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
    <Card>
      <CardHeader>
        <CardTitle as="h4">Patient Details</CardTitle>
      </CardHeader>
      <CardBody>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {/* 🔎 Search Section */}
        {mode === 'search' && (
          <div className="d-flex mb-3 gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name, Email, Phone or combination"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        )}

        {/* 👁 View Mode */}
        {mode === 'view' && (
          <div className="border p-3 rounded">
            <h6>
              {formData.firstname} {formData.lastname}
            </h6>
            <p className="mb-1"><b>Email:</b> {formData.emails}</p>
            <p className="mb-1"><b>Phone:</b> {Array.isArray(formData.phones) ? formData.phones.join(', ') : formData.phones}</p>
            <p className="mb-1"><b>Gender:</b> {formData.legalgender}</p>
            <p className="mb-1"><b>Language:</b> {formData.language}</p>
            <p className="mb-1"><b>City:</b> {formData.city}</p>
            <p className="mb-1"><b>Country:</b> {formData.country}</p>
            <p className="mb-1"><b>Zip Code:</b> {formData.zipcode}</p>
            <p className="mb-1"><b>Address:</b> {formData.street}</p>
            <p className="mb-1"><b>Description:</b> {formData.note}</p>
            <p className="mb-1"><b>DOB:</b> {formData.birthdate ? new Date(formData.birthdate).toLocaleDateString() : ''}</p>
            <div className="d-flex gap-2 mt-2">
              <Button size="sm" onClick={() => setMode('edit')}>Edit</Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFormData(emptyPatient);
                  setMode('search');
                }}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* 📝 Edit / New Patient Form */}
        {(mode === 'edit' || mode === 'new') && (
          <Form>
            {/* Name + Email */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${formData.firstname} ${formData.lastname}`}
                    onChange={(e) => {
                      const [first, ...last] = e.target.value.split(' ');
                      handleChange('firstname', first);
                      handleChange('lastname', last.join(' '));
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.emails || ''}
                    onChange={(e) => handleChange('emails', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Phone + Gender */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={Array.isArray(formData.phones) ? formData.phones.join(', ') : formData.phones || ''}
                    onChange={(e) =>
                      handleChange(
                        'phones',
                        e.target.value.split(',').map((p) => p.trim())
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={formData.legalgender || ''}
                    onChange={(e) => handleChange('legalgender', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Language + DOB */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Preferred Language</Form.Label>
                  <Form.Select
                    value={formData.language || ''}
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <option value="">Select Language</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="nl">Dutch</option>
                  </Form.Select>
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

            {/* Country + City */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    value={formData.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                  >
                    <option value="">Select Country</option>
                    <option value="UK">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="IN">India</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                  >
                    <option value="">Select City</option>
                    <option value="London">London</option>
                    <option value="Paris">Paris</option>
                    <option value="New York">New York</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Zip + Address */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Zip Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.zipcode || ''}
                    onChange={(e) => handleChange('zipcode', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={formData.street || ''}
                    onChange={(e) => handleChange('street', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.note || ''}
                onChange={(e) => handleChange('note', e.target.value)}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setMode('view')}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : mode === 'edit' ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default CustomerInfoCard;
