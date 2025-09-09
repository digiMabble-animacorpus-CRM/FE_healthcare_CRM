'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row, Button, Badge, Collapse } from 'react-bootstrap';
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
    <div>
      {/* Top Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="link" onClick={() => window.history.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back
        </Button>
        {/* You can add an appointment button if you have an agendaLink */}
      </div>

      {/* Profile */}
      <Card className="mb-4 shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={2} className="d-flex justify-content-center">
              {data.photo ? (
                <img
                  src={data.photo}
                  alt={`${data.firstName} ${data.lastName}`}
                  className="rounded-circle object-cover"
                  style={{ width: '140px', height: '140px' }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '140px',
                    height: '140px',
                    backgroundColor: '#e7ddff',
                    color: '#341539',
                    fontSize: '52px',
                    fontWeight: 'bold',
                  }}
                >
                  {data.firstName[0]?.toUpperCase()}
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

      {/* About Section */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between mb-2">
            <h4>About</h4>
            <Button variant="link" size="sm" onClick={() => setAboutOpen(!aboutOpen)}>
              {aboutOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
          <Collapse in={aboutOpen}>
            <div>
              <p>{data.aboutMe || '-'}</p>
            </div>
          </Collapse>
        </CardBody>
      </Card>

      {/* Education & Training */}
      {data.degreesAndTraining && (
        <Card className="mb-4">
          <CardBody>
            <h4>Degrees & Training</h4>
            <p>{data.degreesAndTraining}</p>
          </CardBody>
        </Card>
      )}

      {/* Specializations */}
      {data.specializationIds && data.specializationIds.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Specializations</h4>
            <div className="d-flex gap-2 flex-wrap">
              {data.specializationIds.map((specId) => (
                <Badge key={specId} bg="primary" className="fs-12">
                  {/* Show specialization name if you have mapping, else show ID */}
                  {specId}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Branches & Availability */}
      {data.branches.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Branches & Availability</h4>
            {data.branches.map((branch) => (
              <div key={branch.branch_id} className="mb-3 border p-3 rounded">
                <h5>{branch.branch_name}</h5>
                {Array.isArray(branch.availability) && branch.availability.length > 0 ? (
                  <ul>
                    {branch.availability.map(({ day, startTime, endTime }, idx) => (
                      <li key={idx}>
                        {day}: {startTime} - {endTime}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No available data</p>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Languages</h4>
            <div>{data.languages.join(', ')}</div>
          </CardBody>
        </Card>
      )}

      {/* Payment Methods */}
      {data.paymentMethods && data.paymentMethods.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Payment Methods</h4>
            <div>{data.paymentMethods.join(', ')}</div>
          </CardBody>
        </Card>
      )}

      {/* FAQ */}
      {data.faq && (
        <Card className="mb-4">
          <CardBody>
            <h4>FAQ</h4>
            <p>{data.faq}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TherapistDetails;