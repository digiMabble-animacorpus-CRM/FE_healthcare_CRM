'use client';

import { customerEnquiriesData } from '@/assets/data/other';
import { CustomerEnquiriesType } from '@/types/data';
import { useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap';

interface Props {
  customerInfo: any;
}

const emptyCustomer: CustomerEnquiriesType = {
  _id: "",
  name: "",
  email: "",
  number: "",
  gender: "",
  language: "",
  branch: "",
  dob: "",
  city: "",
  country: "",
  zip_code: "",
  address: "",
  tags: [],
  description: "",
  status: "new",
  lastUpdated: "",
  source: "",
  appointmentDetails: undefined,
  familyDetails: undefined,
  modeOfRegister: ""
};

const CustomerInfoCard = ({ customerInfo = emptyCustomer, onSave }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<CustomerEnquiriesType>(customerInfo);
  const [searchQuery, setSearchQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (field: keyof CustomerEnquiriesType, value: string | string[]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setErrorMsg("Please enter search text");
      setNotFound(false);
      return;
    }

    setErrorMsg("");

    const q = searchQuery.trim().toLowerCase();

    // Filter locally on name, email, or number, allowing partial matches and combination queries
    const results = customerEnquiriesData.filter((customer) => {
      const combinedString = (customer.name + " " + customer.email + " " + customer.number).toLowerCase();
      // Check if all tokens are present in the combined string
      return q.split(/\s+/).every(token => combinedString.includes(token));
    });

    if (results.length > 0) {
      setFormState(results[0]); // Load first matched customer
      setNotFound(false);
    } else {
      setFormState(emptyCustomer);
      setNotFound(true);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(formState);
  };

  return (
    <Card className="mb-4">
      {/* Search Section */}
      <CardHeader>
        <CardTitle as="h6">Search Customer</CardTitle>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={10}>
            <Form.Control
              size="sm"
              placeholder="Search by Name, Email, Phone or combination"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSearch}
              className="w-100"
            >
              Search
            </Button>
          </Col>
        </Row>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {notFound && !errorMsg && <Alert variant="warning">No customer found.</Alert>}
      </CardBody>

      {/* Customer Details Form */}
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle as="h6">Customer Details</CardTitle>
        {isEditing ? (
          <div>
            <Button variant="success" size="sm" onClick={handleSave} className="me-2">
              Save
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>

      <CardBody>
        <Row>
          <Col md={6}>
            <strong>Name:</strong> {customerInfo.name}
          </Col>
          <Col md={6}>
            <strong>Email:</strong> {customerInfo.email}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Phone:</strong> {customerInfo.number}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Gender:</strong> {customerInfo.gender}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Preferred Language:</strong> {customerInfo.language}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Branch:</strong> {customerInfo.branch}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Date of Birth:</strong> {customerInfo.dob}
          </Col>
          <Col md={6} className="mt-2">
            <strong>City:</strong> {customerInfo.city}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Country:</strong> {customerInfo.country}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Zip Code:</strong> {customerInfo.zip_code}
          </Col>
          <Col md={12} className="mt-2">
            <strong>Address:</strong> {customerInfo.address}
          </Col>
          <Col md={12} className="mt-2">
            <strong>Tags:</strong> {customerInfo.tags.length ? customerInfo.tags.join(', ') : '-'}
          </Col>
          <Col md={12} className="mt-2">
            <strong>Description:</strong> {customerInfo.description || '-'}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CustomerInfoCard;
