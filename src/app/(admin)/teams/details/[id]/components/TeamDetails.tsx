import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Collapse, Row, Table } from 'react-bootstrap';
import { FaEnvelope, FaGlobe, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

type FAQItem = { question: string; answer: string };

const BRANCHES = [
  { id: 1, name: 'Central London' },
  { id: 2, name: 'East Side' },
  { id: 3, name: 'North Branch' },
];

type TeamDetailsCardProps = {
  last_name: string;
  first_name: string;
  full_name: string;
  job_1?: string | null;
  job_2?: string | null;
  job_3?: string | null;
  job_4?: string | null;
  specific_audience?: string | null;
  specialization_1?: string | null;
  who_am_i: string;
  consultations: string;
  office_address: string;
  contact_email: string;
  contact_phone: string;
  schedule: Record<string, string> | { text?: string | null };
  about: string;
  languages_spoken: string[];
  payment_methods: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
  frequently_asked_questions: Record<string, string> | FAQItem[];
  calendar_links: string[];
  photo: string;
  role?: string;
  status?: string;
  branches: number[];
  primary_branch_id: number;
};

const TeamDetails = ({
  full_name,
  job_1,
  job_2,
  job_3,
  job_4,
  specific_audience,
  specialization_1,
  who_am_i,
  consultations,
  office_address,
  contact_email,
  contact_phone,
  schedule,
  about,
  languages_spoken,
  payment_methods,
  diplomas_and_training,
  specializations,
  website,
  frequently_asked_questions,
  calendar_links,
  photo,
  role,
  status,
  branches = [],
  primary_branch_id,
}: TeamDetailsCardProps) => {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [whoIAmOpen, setWhoIAmOpen] = useState(true);
  const [consultationOpen, setConsultationOpen] = useState(true);
  const [specificAudienceOpen, setSpecificAudienceOpen] = useState(true);

  // Convert photo URL or fallback
  const photoUrl = photo?.match(/^https?:\/\//) ? photo : '/placeholder-avatar.jpg';

  // Normalize schedule to object form if passed as { text: ... }
  const scheduleObj: Record<string, string> =
    typeof schedule === 'object' && 'text' in schedule && schedule.text
      ? schedule.text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.includes(':'))
          .reduce(
            (acc, line) => {
              const [day, time] = line.split(':');
              acc[day.trim()] = time.trim();
              return acc;
            },
            {} as Record<string, string>,
          )
      : (schedule as Record<string, string>) || {};

  // Convert frequently asked questions from object to array if needed
  const faqArray: FAQItem[] = Array.isArray(frequently_asked_questions)
    ? frequently_asked_questions
    : Object.entries(frequently_asked_questions || {}).map(([question, answer]) => ({
        question,
        answer,
      }));

  return (
    <div>
      {/* Back Button */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => window.history.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back
        </Button>
      </div>

      {/* Profile / Avatar and Basic Info */}
      <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={2} className="d-flex justify-content-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#0d6efd',
                  color: '#fff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                }}
              >
                {full_name ? full_name[0].toUpperCase() : 'T'}
              </div>
            </Col>
            <Col lg={10}>
              <h2 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>
                {full_name}
              </h2>
              <p className="text-muted mb-1">
                {job_1 || '-'} {job_2 ? `/ ${job_2}` : ''} {job_3 ? `/ ${job_3}` : ''}{' '}
                {job_4 ? `/ ${job_4}` : ''}
              </p>
              <p className="mb-2">
                <strong>Primary Specialization:</strong> {specialization_1 || '-'}
              </p>
              <p className="mb-2">
                <strong>Role:</strong> {role || '-'}
              </p>
              <p className="mb-2">
                <strong>Status:</strong> {status || '-'}
              </p>
              <div className="d-flex flex-column gap-2">
                {contact_email && (
                  <div className="d-flex align-items-center gap-2">
                    <FaEnvelope className="text-primary" /> <span>{contact_email}</span>
                  </div>
                )}
                {contact_phone && (
                  <div className="d-flex align-items-center gap-2">
                    <FaPhone className="text-success" /> <span>{contact_phone}</span>
                  </div>
                )}
                {website && (
                  <div className="d-flex align-items-center gap-2">
                    <FaGlobe className="text-info" />{' '}
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {website}
                    </a>
                  </div>
                )}
                {office_address && (
                  <div className="d-flex align-items-center gap-2">
                    <FaMapMarkerAlt className="text-warning" /> <span>{office_address}</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* About */}
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
              <p>{about || '-'}</p>
            </div>
          </Collapse>
        </CardBody>
      </Card>

      {/* Schedule */}
      {Object.keys(scheduleObj).length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Schedule</h4>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(scheduleObj).map(([day, time]) => (
                  <tr key={day}>
                    <td style={{ textTransform: 'capitalize' }}>{day}</td>
                    <td>{time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Branches */}
      <Card className="mb-4">
        <CardBody>
          <h4>Branches</h4>
          <div className="d-flex flex-wrap gap-2">
            {(branches || []).map((branchId: number) => {
              const branch = BRANCHES.find((b) => b.id === branchId);
              const isPrimary = branchId === primary_branch_id;
              return (
                <Badge
                  key={branchId}
                  bg={isPrimary ? 'success' : 'secondary'}
                  className="fs-13 text-white px-2 py-1"
                  title={branch?.name || 'Unknown'}
                >
                  {branch?.name || branchId}
                  {isPrimary ? ' (Primary)' : ''}
                </Badge>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Languages Spoken */}
      {languages_spoken.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Languages Spoken</h4>
            <div className="d-flex flex-wrap gap-2">
              {languages_spoken.map((lang, i) => (
                <Badge key={i} bg="info" className="fs-13 text-dark px-2 py-1">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Payment Methods */}
      {payment_methods.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Payment Methods</h4>
            <div className="d-flex flex-wrap gap-2">
              {payment_methods.map((method, i) => (
                <Badge key={i} bg="primary" className="fs-12">
                  {method}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Diplomas & Training */}
      {diplomas_and_training.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Education & Training</h4>
            <div className="d-flex flex-wrap gap-2">
              {diplomas_and_training.map((edu, i) => (
                <Badge key={i} bg="info" className="fs-13 text-dark px-2 py-1">
                  {edu}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Specializations */}
      {specializations.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Specializations</h4>
            <div className="d-flex flex-wrap gap-2">
              {specializations.map((spec, i) => (
                <Badge key={i} bg="primary" className="fs-12">
                  {spec}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Consultations */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between mb-2">
            <h4>Consultations</h4>
            <Button variant="link" size="sm" onClick={() => setConsultationOpen(!consultationOpen)}>
              {consultationOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
          <Collapse in={consultationOpen}>
            <div>
              <p>{consultations || '-'}</p>
            </div>
          </Collapse>
        </CardBody>
      </Card>

      {/* Specific Audience */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between mb-2">
            <h4>Specific Audience</h4>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSpecificAudienceOpen(!specificAudienceOpen)}
            >
              {specificAudienceOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
          <Collapse in={specificAudienceOpen}>
            <div>
              <p>{specific_audience || '-'}</p>
            </div>
          </Collapse>
        </CardBody>
      </Card>

      {/* Who I Am */}
      <Card className="mb-4">
        <CardBody>
          <h4>Who I Am</h4>
          <p>{who_am_i || '-'}</p>
        </CardBody>
      </Card>

      {/* Calendar Links */}
      <Card className="mb-4">
        <CardBody>
          <h4>Calendar Links</h4>
          {calendar_links.length > 0 ? (
            <ul>
              {calendar_links.map((link, idx) => (
                <li key={idx}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>-</p>
          )}
        </CardBody>
      </Card>

      {/* Frequently Asked Questions */}
      {faqArray.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Frequently Asked Questions</h4>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                </tr>
              </thead>
              <tbody>
                {faqArray.map(({ question, answer }, idx) => (
                  <tr key={idx}>
                    <td>{question}</td>
                    <td>{answer}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TeamDetails;
