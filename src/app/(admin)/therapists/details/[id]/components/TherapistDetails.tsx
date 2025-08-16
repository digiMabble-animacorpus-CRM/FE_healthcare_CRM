'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, Badge, Collapse, Accordion } from 'react-bootstrap';
import type { TherapistType } from '@/types/data';

type Props = {
  data: TherapistType;
};

const TherapistDetails = ({ data }: Props) => {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  // Ensure valid URL for next/image
  const photoUrl = data.photo?.match(/^https?:\/\//) ? data.photo : '/placeholder-avatar.jpg';

  const specializations = data.specializations
    ? data.specializations.split('\n').map((s) => s.trim())
    : [];

  const branches = data.centerAddress ? data.centerAddress.split(',').map((b) => b.trim()) : [];

  const faqs = data.faq
    ? data.faq.split('\n').map((item) => {
        const [question, answer] = item.split(':');
        return { question: question?.trim() || '-', answer: answer?.trim() || '-' };
      })
    : [];

  {
    /* Languages */
  }
  const languages = data.spokenLanguages
    ? data.spokenLanguages.split(',').map((l) => l.trim())
    : [];

  return (
    <Card className="my-4">
      <CardBody>
        {/* Header */}
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={photoUrl}
              alt="avatar"
              width={100}
              height={100}
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              <h3 className="fw-semibold mb-1">{data.fullName}</h3>
              <p className="link-primary fw-medium fs-14">{data.jobTitle}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            {data.agendaLinks && (
              <Button variant="primary" onClick={() => window.open(data.agendaLinks!, '_blank')}>
                Book Appointment
              </Button>
            )}
          </div>
        </div>
        {/* Contact Info */}
        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Email:</p>
            <p className="mb-0">{data.contactEmail || '-'}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Phone:</p>
            <p className="mb-0">{data.contactPhone || '-'}</p>
          </Col>
          <Col lg={5}>
            <p className="text-dark fw-semibold fs-16 mb-1">Website:</p>
            <p className="mb-0">
              {data.website ? (
                <a href={data.website} target="_blank" rel="noopener noreferrer">
                  {data.website}
                </a>
              ) : (
                '-'
              )}
            </p>
          </Col>
        </Row>
        {/* About Me */}
        <Row className="my-3">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">
              About Me:
              <Button
                variant="link"
                size="sm"
                onClick={() => setAboutOpen(!aboutOpen)}
                className="ms-2 p-0"
              >
                {aboutOpen ? 'Hide' : 'Show'}
              </Button>
            </p>
            <Collapse in={aboutOpen}>
              <div>
                <p className="mb-0">{data.aboutMe || '-'}</p>
              </div>
            </Collapse>
          </Col>
        </Row>
        {/* Schedule */}
        <Row className="my-3">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">
              Schedule:
              <Button
                variant="link"
                size="sm"
                onClick={() => setScheduleOpen(!scheduleOpen)}
                className="ms-2 p-0"
              >
                {scheduleOpen ? 'Hide' : 'Show'}
              </Button>
            </p>
            <Collapse in={scheduleOpen}>
              <div>
                <p className="mb-0">{data.schedule || '-'}</p>
              </div>
            </Collapse>
          </Col>
        </Row>
        {/* Branches */}
        <Row className="my-4">
          {branches.map((branch, idx) => (
            <Col lg={4} key={idx}>
              <Card className="mb-3 shadow-sm">
                <CardBody>
                  <p className="text-dark fw-semibold fs-14 mb-1">Branch {idx + 1}</p>
                  <p className="mb-1">{branch}</p>
                  <p className="mb-0">
                    Email:{' '}
                    {data.centerEmail ? data.centerEmail.split(',')[idx]?.trim() || '-' : '-'}
                  </p>
                  <p className="mb-0">
                    Phone:{' '}
                    {data.centerPhoneNumber
                      ? data.centerPhoneNumber.split(',')[idx]?.trim() || '-'
                      : '-'}
                  </p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
        {/* Specializations */}
        {specializations.length > 0 && (
          <Row className="my-4">
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-1">Specializations:</p>
              <div className="d-flex flex-wrap gap-2">
                {specializations.map((spec, i) => {
                  let variant = 'secondary';
                  const lower = spec.toLowerCase();
                  if (lower.includes('clinicienne') || lower.includes('psychologue'))
                    variant = 'primary';
                  else if (lower.includes('familiale') || lower.includes('systémique'))
                    variant = 'success';
                  else if (lower.includes('thérapie') || lower.includes('burnout'))
                    variant = 'warning';
                  return (
                    <Badge key={i} bg={variant} className="fs-12">
                      {spec}
                    </Badge>
                  );
                })}
              </div>
            </Col>
          </Row>
        )}
        {/* Degrees & Training */}
        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Degrees & Training:</p>
            <p className="mb-0">{data.degreesAndTraining || '-'}</p>
          </Col>
        </Row>
        {/* Consultations */}
        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Consultations / Role:</p>
            <p className="mb-0">{data.consultations || '-'}</p>
          </Col>
        </Row>
        {/* Languages */}
        {languages.length > 0 && (
          <Row className="my-4">
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-1">Languages:</p>
              <div className="d-flex flex-wrap gap-2">
                {languages.map((lang, i) => {
                  let variant = 'secondary';
                  const lower = lang.toLowerCase();
                  // Optional: different color based on language
                  if (lower === 'english') variant = 'primary';
                  else if (lower === 'french') variant = 'success';
                  else if (lower === 'german') variant = 'warning';

                  return (
                    <Badge key={i} bg={variant} className="fs-12">
                      {lang}
                    </Badge>
                  );
                })}
              </div>
            </Col>
          </Row>
        )}
        {/* FAQ */}
        {faqs.length > 0 && (
          <Row className="my-4">
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-2">FAQ:</p>
              <Accordion>
                {faqs.map((faq, index) => (
                  <Accordion.Item eventKey={index.toString()} key={index}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default TherapistDetails;
