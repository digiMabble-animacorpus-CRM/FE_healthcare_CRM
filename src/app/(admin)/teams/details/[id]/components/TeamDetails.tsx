import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Collapse, Row, Table } from 'react-bootstrap';
import { FaEnvelope, FaGlobe, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const BRANCHES = [
  { id: 1, name: 'Gembloux - Orneau' },
  { id: 2, name: 'Gembloux - Tout Vent' },
  { id: 3, name: 'Namur' },
];

type FAQItem = { question: string; answer: string };

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
  frequently_asked_questions: string | Record<string, string> | FAQItem[];
  calendar_links: string[];
  photo: string;
  role?: string;
  status?: string;
  branches: branch[];
  primary_branch_id: number;
};

type branch = {
  branch_id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  location: string;
  is_active: boolean;
  created_at: string;
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

  const photoUrl = photo?.match(/^https?:\/\//) ? photo : '/placeholder-avatar.jpg';

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

  // ✅ Normalize FAQ input
  let faqArray: FAQItem[] = [];
  if (Array.isArray(frequently_asked_questions)) {
    faqArray = frequently_asked_questions;
  } else if (
    typeof frequently_asked_questions === 'object' &&
    frequently_asked_questions !== null
  ) {
    faqArray = Object.entries(frequently_asked_questions).map(([question, answer]) => ({
      question,
      answer: String(answer),
    }));
  } else if (typeof frequently_asked_questions === 'string') {
    faqArray = frequently_asked_questions
      .split(/\n/)
      .reduce((acc: FAQItem[], line: string, idx: number, arr: string[]) => {
        if (idx % 2 === 0 && line.trim() !== '') {
          acc.push({ question: line.trim(), answer: arr[idx + 1]?.trim() || '' });
        }
        return acc;
      }, []);
  }

  return (
    <div>
      {/* Back Button */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => window.history.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Retour à la liste
        </Button>
      </div>

      {/* Profile */}
      <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
        <CardBody>
          <Row>
            {/* Left Column */}
            <Col lg={6}>
              <Row className="align-items-center mb-3">
                <Col xs="auto">
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
                <Col>
                  <h2 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>
                    {full_name}
                  </h2>
                  <p className="text-muted mb-1">
                    <strong>Emploi:</strong> {job_1 || '-'}
                    {job_2 ? ` / ${job_2}` : ''}
                    {job_3 ? ` / ${job_3}` : ''}
                    {job_4 ? ` / ${job_4}` : ''}
                  </p>
                  <p className="mb-1">
                    <strong>Spécialisation primaire:</strong> {specialization_1 || '-'}
                  </p>
                  <p className="mb-1">
                    <strong>Rôle:</strong> {role || '-'}
                  </p>
                  <p className="mb-1">
                    <strong>Statut:</strong> {status || '-'}
                  </p>
                  <div className="d-flex flex-column gap-2">
                    {contact_email && (
                      <div className="d-flex align-items-center gap-2">
                        <FaEnvelope className="text-primary" /> <span>{contact_email.trim()}</span>
                      </div>
                    )}
                    {contact_phone && (
                      <div className="d-flex align-items-center gap-2">
                        <FaPhone className="text-success" /> <span>{contact_phone.trim()}</span>
                      </div>
                    )}
                    {website && (
                      <div className="d-flex align-items-center gap-2">
                        <FaGlobe className="text-info" />
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
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Right Column */}
            <Col lg={6}>
              {office_address && (
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaMapMarkerAlt className="text-warning" />
                    <strong>Adresse du bureau principal:</strong>
                  </div>
                  <div className="d-flex flex-column gap-1 ms-4">
                    {office_address
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                  </div>
                </div>
              )}
              {branches?.length > 0 && (
                <div>
                  <strong>Succursales disponibles:</strong> {branches.map((b) => b.name).join(', ')}
                </div>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* About */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between mb-2">
            <h4>À propos</h4>
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
            <h4>Calendrier</h4>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Temps</th>
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

      {/* Languages Spoken */}
      {languages_spoken.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Langues parlées</h4>
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
            <h4>Méthodes de paiement</h4>
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
            <h4>Éducation et formation</h4>
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
            <h4>Spécialisations</h4>
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
            <h4>Public spécifique</h4>
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
          <h4>Qui suis-je</h4>
          <p>{who_am_i || '-'}</p>
        </CardBody>
      </Card>

      {/* Calendar Links */}
      <Card className="mb-4">
        <CardBody>
          <h4>Liens du calendrier</h4>
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

      {/* FAQ */}
      {faqArray.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Questions fréquemment posées:</h4>
            <ol style={{ paddingLeft: '1.2rem' }}>
              {faqArray.map(({ question, answer }, idx) => (
                <li key={idx} style={{ marginBottom: '1rem' }}>
                  <strong>{question}</strong>
                  <div>{answer}</div>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TeamDetails;
