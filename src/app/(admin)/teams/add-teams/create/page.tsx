'use client';

import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { TeamType } from '@/assets/data/TeamType';

type TeamFormProps = {
  onSubmitHandler: (formData: TeamType) => void;
};

const initialFormData: TeamType = {
  LastName: '',
  FirstName: '',
  NomComplet: '',
  Function: '',
  PublicSpecific: '',
  Specialisation: '',
  Function2: '',
  Function3: '',
  Function4: '',
  WhoAmI: '',
  Consultations: '',
  Address: {
    street: '',
    city: '',
    zip_code: '',
    country: '',
  },
  ContactMail: '',
  PhoneNumber: '',
  Hourly: '',
  About: '',
  LanguesParlees: '',
  PaymentMethod: '',
  DiplomasTrainings: '',
  Specialisations: '',
  Website: '',
  FAQ: '',
  LiensAgenda: '',
  Photo: '',
  ID_Pro: ''
};

const TeamForm: React.FC<TeamFormProps> = ({ onSubmitHandler }) => {
  const [formData, setFormData] = useState<TeamType>(initialFormData);
  const router = useRouter();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (name.startsWith('Address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        Address: {
          ...prev.Address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmitHandler(formData);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">Add Team Member</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Personal Information */}
          <h5 className="mb-3 mt-1">Personal Information</h5>
          <Row>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control name="LastName" value={formData.LastName} onChange={handleChange} placeholder="Enter last name" required />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control name="FirstName" value={formData.FirstName} onChange={handleChange} placeholder="Enter first name" required />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name (Nom complet)</Form.Label>
                <Form.Control name="NomComplet" value={formData.NomComplet} onChange={handleChange} placeholder="Enter full name" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number *</Form.Label>
                <Form.Control name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} placeholder="Enter phone" required type="tel" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Email *</Form.Label>
                <Form.Control name="ContactMail" value={formData.ContactMail} onChange={handleChange} placeholder="Enter email" required type="email" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Photo URL</Form.Label>
                <Form.Control name="Photo" value={formData.Photo} onChange={handleChange} placeholder="Photo URL" />
              </Form.Group>
            </Col>
          </Row>

          {/* Professional Information */}
          <h5 className="mb-3 mt-4">Professional Information</h5>
          <Row>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Function</Form.Label>
                <Form.Control name="Function" value={formData.Function} onChange={handleChange} placeholder="Function" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Public Specific</Form.Label>
                <Form.Control name="PublicSpecific" value={formData.PublicSpecific} onChange={handleChange} placeholder="Public specific" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Specialisation</Form.Label>
                <Form.Control name="Specialisation" value={formData.Specialisation} onChange={handleChange} placeholder="Specialisation" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Function 2</Form.Label>
                <Form.Control name="Function2" value={formData.Function2} onChange={handleChange} placeholder="Function 2" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Function 3</Form.Label>
                <Form.Control name="Function3" value={formData.Function3} onChange={handleChange} placeholder="Function 3" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Function 4</Form.Label>
                <Form.Control name="Function4" value={formData.Function4} onChange={handleChange} placeholder="Function 4" />
              </Form.Group>
            </Col>
          </Row>

          {/* Bio & Details */}
          <h5 className="mb-3 mt-4">Bio & Details</h5>
          <Row>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Who Am I</Form.Label>
                <Form.Control name="WhoAmI" as="textarea" value={formData.WhoAmI} onChange={handleChange} placeholder="Describe yourself" rows={2} />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Consultations</Form.Label>
                <Form.Control name="Consultations" as="textarea" value={formData.Consultations} onChange={handleChange} placeholder="Consultation details" rows={2} />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Hourly Rate</Form.Label>
                <Form.Control name="Hourly" value={formData.Hourly} onChange={handleChange} placeholder="Hourly Rate" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Form.Group className="mb-3">
                <Form.Label>About</Form.Label>
                <Form.Control name="About" as="textarea" value={formData.About} onChange={handleChange} placeholder="About..." rows={3} />
              </Form.Group>
            </Col>
          </Row>

          {/* Address Information */}
          <h5 className="mb-3 mt-4">Address Information</h5>
          <Row>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Street</Form.Label>
                <Form.Control name="Address.street" value={formData.Address.street} onChange={handleChange} placeholder="Street" />
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control name="Address.city" value={formData.Address.city} onChange={handleChange} placeholder="City" />
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Zip Code</Form.Label>
                <Form.Control name="Address.zip_code" value={formData.Address.zip_code} onChange={handleChange} placeholder="Zip Code" />
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control name="Address.country" value={formData.Address.country} onChange={handleChange} placeholder="Country" />
              </Form.Group>
            </Col>
          </Row>

          {/* Other Details */}
          <h5 className="mb-3 mt-4">Other Details</h5>
          <Row>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Langues parlées</Form.Label>
                <Form.Control name="LanguesParlees" value={formData.LanguesParlees} onChange={handleChange} placeholder="Langues parlées" />
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Control name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange} placeholder="Payment Method" />
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Diplomas and Trainings</Form.Label>
                <Form.Control name="DiplomasTrainings" as="textarea" value={formData.DiplomasTrainings} onChange={handleChange} placeholder="Diplomas and Trainings" />
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Group className="mb-3">
                <Form.Label>Specialisations</Form.Label>
                <Form.Control name="Specialisations" as="textarea" value={formData.Specialisations} onChange={handleChange} placeholder="Specialisations" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control name="Website" value={formData.Website} onChange={handleChange} placeholder="Website" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>FAQ</Form.Label>
                <Form.Control name="FAQ" as="textarea" value={formData.FAQ} onChange={handleChange} placeholder="FAQ" />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Liens Agenda</Form.Label>
                <Form.Control name="LiensAgenda" value={formData.LiensAgenda} onChange={handleChange} placeholder="Liens Agenda" />
              </Form.Group>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2 mt-2">
          <Col lg={2}>
            <Button variant="outline-primary" type="submit" className="w-100">
              Add Team Member
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="danger" className="w-100" onClick={() => router.back()}>
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default TeamForm;
