import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Badge, Button, Card, CardBody, Col, Row, Table } from 'react-bootstrap';
import { FaEnvelope, FaGlobe, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

type Branch = {
  branch_id: number | string;
  name?: string; // <-- add this
  availability?: { day: string; startTime: string; endTime: string }[];
};
type Department = {
  id: number | string;
  name: string;
  description?: string;
};
type TeamDetailsCardProps = {
  firstName?: string;
  lastName?: string;
  full_name?: string;
  imageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  aboutMe?: string;
  degreesTraining?: string;
  inamiNumber?: string | number;
  payment_methods?: string[];
  faq?: { question: string; answer: string }[];
  website?: string;
  consultations?: string;
  role?: string;
  status?: string;
  languagesSpoken?: string[];
  department?: Department;
  specializationIds?: (string | number)[];
  branches?: Branch[];
  availability?: { day: string; startTime: string; endTime: string }[]; // ✅ add this
};

const TherapistTeamDetails = ({
  firstName,
  lastName,
  full_name,
  imageUrl,
  contactEmail,
  contactPhone,
  aboutMe,
  degreesTraining,
  inamiNumber,
  payment_methods = [],
  faq = [],
  website,
  consultations,
  role,
  status,
  languagesSpoken = [],
  department,
  specializationIds = [],
  branches = [],
  availability = [],
}: TeamDetailsCardProps) => {
  const displayName = full_name || `${firstName} ${lastName}`;
  const photoUrl = imageUrl?.match(/^https?:\/\//) ? imageUrl : '/placeholder-avatar.jpg';

  // remove departmentId usage
  const primaryBranch = branches.length > 0 ? branches[0] : undefined;

  const scheduleObj = primaryBranch?.availability?.length
    ? primaryBranch.availability.reduce(
        (
          acc: Record<string, string>,
          item: { day: string; startTime: string; endTime: string },
        ) => {
          acc[item.day] = `${item.startTime} - ${item.endTime}`;
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  return (
    <div className="container py-4">
      {/* Back Button */}
      <div className="d-flex justify-content-left mb-3">
        <Button variant="primary" onClick={() => window.history.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Retour à la liste
        </Button>
      </div>
      {/* Profile Section */}
      <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
        <CardBody>
          <Row>
            <Col md={3} className="d-flex flex-column align-items-center justify-content-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={displayName}
                  className="rounded-circle"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ) : (
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
                  {displayName?.trim().charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              {/* ✅ Add therapist name below photo */}
              <h5 className="mt-3 text-center">{displayName}</h5>
            </Col>

            <Col md={9}>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>INAMI:</strong> {inamiNumber ?? '-'}
                  </div>
                  <div className="mb-2">
                    <strong>Rôle:</strong> {role ?? '-'}
                  </div>
                  <div className="mb-2">
                    <strong>Statut:</strong> {status ?? '-'}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong>{' '}
                    {contactEmail ? (
                      <span>
                        <FaEnvelope className="text-primary mx-1" />
                        {contactEmail}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>Téléphone:</strong>{' '}
                    {contactPhone ? (
                      <span>
                        <FaPhone className="text-success mx-1" />
                        {contactPhone}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>Site web:</strong>{' '}
                    {website ? (
                      <a href={website} target="_blank" rel="noopener noreferrer">
                        {website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Diplômes & Formation:</strong> {degreesTraining ?? '-'}
                  </div>
                  <div className="mb-2">
                    <strong>Département:</strong> {department?.name ?? '-'}
                  </div>

                  <div className="mb-2">
                    <strong>Branches:</strong>{' '}
                    {branches.length > 0
                      ? branches.map((b: Branch) => b.name ?? `#${b.branch_id}`).join(', ')
                      : '-'}
                  </div>

                  <div className="mb-2">
                    <strong>Spécialisations:</strong>{' '}
                    {specializationIds.length > 0 ? specializationIds.join(', ') : '-'}
                  </div>

                  <div className="mb-2">
                    <strong>Méthodes de paiement:</strong>
                    {payment_methods.length > 0
                      ? payment_methods.map((method: string, i: number) => (
                          <Badge key={i} bg="primary" className="mx-1">
                                  {method}   {' '}
                          </Badge>
                        ))
                      : '-'}
                  </div>
                  <div className="mb-2">
                    <strong>Languages Spoken:</strong>
                    {languagesSpoken.length > 0
                      ? languagesSpoken.map((lang: any, i: number) => (
                          <Badge key={i} bg="info" className="mx-1 text-dark">
                            {typeof lang === 'string' ? lang : lang.language_name}
                          </Badge>
                        ))
                      : '-'}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardBody>
      </Card>
      {/* About */}
      <Card className="mb-4">
        <CardBody>
          <h4>À propos</h4>
          <p>{aboutMe ?? '-'}</p>
        </CardBody>
      </Card>
      {/* Schedule */}
      <Card className="mb-4">
        <CardBody>
          <h4>Calendrier</h4>
          {Array.isArray(availability) && availability.length > 0 ? (
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start time</th>
                  <th>End time</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((slot, idx) => (
                  <tr key={idx}>
                    <td style={{ textTransform: 'capitalize' }}>{slot.day || '-'}</td>
                    <td>{slot.startTime || '-'}</td>
                    <td>{slot.endTime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>-</p>
          )}
        </CardBody>
      </Card>

      {/* Consultations */}
      <Card className="mb-4">
        <CardBody>
          <h4>Consultations</h4>
          <p>{consultations ?? '-'}</p>
        </CardBody>
      </Card>
      {/* FAQ */}
      <Card className="mb-4">
        <CardBody>
          <h4>Questions fréquemment posées:</h4>
          {faq.length > 0 ? (
            <ol style={{ paddingLeft: '1.2rem' }}>
              {faq.map(
                ({ question, answer }: { question: string; answer: string }, idx: number) => (
                  <li key={idx} style={{ marginBottom: '1rem' }}>
                    <strong>{question}</strong>
                    <div>{answer}</div>
                  </li>
                ),
              )}
            </ol>
          ) : (
            <p>-</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TherapistTeamDetails;
