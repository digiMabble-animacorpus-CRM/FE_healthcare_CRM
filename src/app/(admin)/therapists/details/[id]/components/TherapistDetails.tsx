'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Col, Button, Badge, Collapse, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import type { TherapistType, BranchWithAvailability } from '@/types/data';

type TherapistDetailsProps = {
  data: TherapistType;
  departmentsMap?: Record<number, string>; // optional mapping of deptId -> name
  specializationsMap?: Record<number, string>; // optional mapping of specId -> name
};

const TherapistDetails = ({
  data,
  departmentsMap = {},
  specializationsMap = {},
}: TherapistDetailsProps) => {
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
      {' '}
      <CardBody>
        {' '}
        {/* Header */}{' '}
        <div className="d-flex justify-content-between mb-3">
          {' '}
          <Button variant="link" onClick={() => window.history.back()}>
            {' '}
            <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back{' '}
          </Button>{' '}
          <div className="d-flex gap-1">
            {' '}
            <Button
              variant="secondary"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              onClick={() => handleEditClick(data.therapistId!)}
            >
              {' '}
              <span>
                {' '}
                <IconifyIcon icon="ri:edit-fill" />{' '}
              </span>{' '}
            </Button>{' '}
          </div>{' '}
        </div>
        {/* Profile Section */}
        <Row className="align-items-center mb-4">
          <Col md={2} className="text-center">
            {data.photo && data.photo.trim() !== '' && data.photo !== 'null' ? (
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
            <h3 className="fw-bold mb-1">
              {data.firstName} {data.lastName}
            </h3>
            <div className="d-flex gap-3 flex-wrap">
              {data.contactEmail && (
                <div className="d-flex align-items-center gap-2">
                  <FaEnvelope className="text-primary" />
                  <span>{data.contactEmail}</span>
                </div>
              )}
              {data.contactPhone && (
                <div className="d-flex align-items-center gap-2">
                  <FaPhone className="text-success" />
                  <span>{data.contactPhone}</span>
                </div>
              )}
            </div>
          </Col>
        </Row>
        {/* Grid Details */}
        <Row className="mb-3">
          <Col md={6}>
            <strong>INAMI Number:</strong> {data.inamiNumber || '-'}
          </Col>
          <Col md={6}>
            <strong>Department:</strong> {departmentsMap[data.departmentId || 0] || '-'}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Languages:</strong>{' '}
            {data.languages?.length > 0 ? data.languages.join(', ') : '-'}
          </Col>
          <Col md={6}>
            <strong>Payment Methods:</strong>{' '}
            {data.paymentMethods?.length > 0 ? data.paymentMethods.join(', ') : '-'}
          </Col>
        </Row>
        {data.faq && (
          <Row className="mb-3">
            <Col>
              <strong>FAQ:</strong> {data.faq}
            </Col>
          </Row>
        )}
        {/* About Section */}
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2">
            <h5>About</h5>
            <Button variant="link" size="sm" onClick={() => setAboutOpen(!aboutOpen)}>
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
                  {specializationsMap[specId] || specId}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Branches & Availability Table */}
        {data.branches && data.branches.length > 0 && (
          <div className="mt-4">
            <h5>Branches & Availability</h5>
            {data.branches.map((branch: BranchWithAvailability) => (
              <div key={branch.branch_id} className="mb-3 p-3 border rounded bg-light">
                <h6>{branch.branch_name || '-'}</h6>
                {branch.availability && branch.availability.length > 0 ? (
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branch.availability.map((av, idx) => (
                        <tr key={idx}>
                          <td>{av.day || '-'}</td>
                          <td>{av.startTime || '-'}</td>
                          <td>{av.endTime || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted mb-0">No availability data</p>
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
