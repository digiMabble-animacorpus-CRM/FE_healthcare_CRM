'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Col, Button, Badge, Collapse } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { FaEnvelope, FaPhone, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import type { TherapistType } from '@/types/data';

type TherapistDetailsProps = {
  data: TherapistType;
};

const TherapistDetails = ({ data }: TherapistDetailsProps) => {
  const [aboutOpen, setAboutOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEditClick = (id: string | number) => {
    router.push(`/therapists/edit-therapist/${id}`);
  };

  return (
    <Card className="mb-4 shadow-lg">
      <CardBody>
        {/* Header */}
        <div className="d-flex justify-content-between mb-3">
          <Button variant="link" onClick={() => window.history.back()}>
            <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back
          </Button>
         <div className="d-flex gap-1">
              <Button
                variant="secondary"
                className="avatar-sm d-flex align-items-center justify-content-center fs-20"
                onClick={() => handleEditClick(id)}
              >
                <span>
                  {' '}
                  <IconifyIcon icon="ri:edit-fill" />
                </span>
              </Button>
            </div>
        </div>

        {/* Profile Section */}
        <Row className="align-items-center mb-4">
          <Col md={2} className="text-center">
            {data.photo && data.photo !== 'null' && data.photo.trim() !== '' ? (
              <img
                src={data.photo}
                alt={`${data.firstName} ${data.lastName}`}
                className="rounded-circle object-cover"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#e7ddff',
                  color: '#341539',
                  fontSize: '42px',
                  fontWeight: 'bold',
                }}
              >
                {data.firstName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </Col>
          <Col md={10}>
            <h3 className="fw-bold mb-1">{data.firstName} {data.lastName}</h3>
            <div className="d-flex gap-3 flex-wrap">
              {data.contactEmail && (
                <div className="d-flex align-items-center gap-2">
                  <FaEnvelope className="text-primary" />
                  <span>{data.contactEmail}</span>
                </div>
              )}
            </Col>
            <Col lg={10}>
              <div className="d-flex justify-content-between">
                <h2 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>
                  {data.firstName} {data.lastName}
                </h2>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => (data.therapistId !== undefined && data.therapistId !== null) && handleEditClick(data.therapistId)}
                >
                  <FaEdit className="me-1" /> Edit
                </Button>
              </div>
              <div className="d-flex flex-column gap-2">
                {data.contactEmail && (
                  <div className="d-flex align-items-center gap-2">
                    <FaEnvelope className="text-primary" /> <span>{data.contactEmail}</span>
                  </div>
                )}
                {data.contactPhone && (
                  <div className="d-flex align-items-center gap-2">
                    <FaPhone className="text-success" /> <span>{data.contactPhone}</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

        {/* Grid Details */}
        <Row className="mb-3">
          <Col md={6}>
            <strong>Inami Number :</strong> {data.inamiNumber || '-'}
          </Col>
          <Col md={6}>
            <strong>Consultations :</strong> {data.consultations || '-'}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Department :</strong> {data.departmentId || '-'}
          </Col>
          <Col md={6}>
            <strong>Languages :</strong>{' '}
            {data.languages?.length > 0 ? data.languages.join(', ') : '-'}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Payment Methods :</strong>{' '}
            {data.paymentMethods?.length > 0 ? data.paymentMethods.join(', ') : '-'}
          </Col>
          <Col md={6}>
            <strong>FAQ :</strong> {data.faq || '-'}
          </Col>
        </Row>

        {/* About Section */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <h5>About</h5>
            <Button
              variant="link"
              size="sm"
              onClick={() => setAboutOpen(!aboutOpen)}
            >
              {aboutOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
          <Collapse in={aboutOpen}>
            <div>
              <p>{data.aboutMe || '-'}</p>
            </div>
          </Collapse>
        </div>

        {/* Degrees & Training */}
        {data.degreesAndTraining && (
          <div className="mt-4">
            <h5>Degrees & Training</h5>
            <p>{data.degreesAndTraining}</p>
          </div>
        )}

        {/* Specializations */}
        {data.specializationIds && data.specializationIds.length > 0 && (
          <div className="mt-4">
            <h5>Specializations</h5>
            <div className="d-flex gap-2 flex-wrap">
              {data.specializationIds.map((specId) => (
                <Badge key={specId} bg="primary" className="fs-12">
                  {specId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Branches & Availability */}
        {data.branches && data.branches.length > 0 && (
          <div className="mt-4">
            <h5>Branches & Availability</h5>
            {data.branches.map((branch) => (
              <div key={branch.branch_id} className="mb-3 p-3 border rounded bg-light">
                <h6>{branch.branch_name}</h6>
                {Array.isArray(branch.availability) &&
                branch.availability.length > 0 ? (
                  <ul className="mb-0">
                    {branch.availability.map((av: any, idx: number) => (
                      <li key={idx}>
                        {av.day || av.date}: {av.startTime} - {av.endTime}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mb-0">No available data</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TherapistDetails;
