'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import type { TherapistType } from '@/types/data';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Collapse, Row, Table } from 'react-bootstrap';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import { BranchWithAvailability } from '../../../add-therapist/components/AddTherapist';

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
            {data.imageUrl && data.imageUrl.trim() !== '' && data.imageUrl !== 'null' ? (
              <img
                src={data.imageUrl}
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
                  fontSize: '40px',
                  fontWeight: 'bold',
                }}
              >
                {data.firstName?.charAt(0).toUpperCase()}
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
            <strong>Numéro INAMI:</strong> {data.inamiNumber || '-'}
          </Col>
          <Col md={6}>
            <strong>Department:</strong>{' '}
            {data.departmentName || departmentsMap[data.departmentId || 0] || '-'}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Languages:</strong>{' '}
            {data.languages?.length > 0
              ? data.languages.map((lang: any) => lang.name).join(', ')
              : '-'}
          </Col>

          <Col md={6}>
            <strong>Méthodes de paiement:</strong>{' '}
            {data.paymentMethods?.length > 0 ? data.paymentMethods.join(', ') : '-'}
          </Col>
          {data.faq && (
            <Row className="my-4">
              <Col lg={12}>
                <p className="fw-semibold mb-1">Frequently Asked Questions:</p>
                {data.faq ? (
                  <ol style={{ paddingLeft: '1.2rem' }}>
                    {(() => {
                      const lines = data.faq.split('\r\n').filter((line) => line.trim() !== '');
                      const items: { question: string; answer: string }[] = [];
                      for (let i = 0; i < lines.length; i += 2) {
                        const question = lines[i] || '';
                        const answer = lines[i + 1] || '';
                        items.push({ question, answer });
                      }
                      return items.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '1rem' }}>
                          <div>
                            <strong>{item.question.trim()}</strong>
                          </div>
                          <div>{item.answer.trim()}</div>
                        </li>
                      ));
                    })()}
                  </ol>
                ) : (
                  <span>-</span>
                )}
              </Col>
            </Row>
          )}
        </Row>
        {/* About Section */}
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2">
            <h5>À propos</h5>
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
        {data.degreesAndTraining && (
          <div className="mt-4">
            <h5>Diplômes et formations</h5>
            <p>{data.degreesAndTraining}</p>
          </div>
        )}
        {data.specializations && data.specializations.length > 0 && (
          <div className="mt-4">
            <h5>Spécialisations</h5>
            <div className="d-flex gap-2 flex-wrap">
              {data.specializations.map((spec: { id: any; name: any }) => (
                <Badge key={spec.id ?? spec.name} bg="primary" className="fs-12">
                  {spec.name || specializationsMap[spec.id ?? 0] || spec.id}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Branches & Availability Table */}
        {data.branches && data.branches.length > 0 && (
          <div className="mt-4">
            <h5>Succursales et disponibilité</h5>
            {data.branches.map((branch: BranchWithAvailability) => (
              <div key={branch.branch_id} className="mb-3 p-3 border rounded bg-light">
                <h6>{branch.branch_name || '-'}</h6>
                {branch.availability && branch.availability.length > 0 ? (
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Jour</th>
                        <th>Heure de début</th>
                        <th>Heure de fin</th>
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
                  <p className="text-muted mb-0">Aucune donnée de disponibilité</p>
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
