'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row, Button, Badge, Collapse, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import { FaClock, FaMapMarkerAlt, FaEnvelope, FaPhone, FaEdit, FaGlobe } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

type WeeklySessionType = { week: string; sessions: number };
type StatType = { title: string; count: number; progress: number; icon: string; variant: string };
type TransactionType = { date: string; type: string; amount: number; status: string };
type FeedbackType = {
  name: string;
  userName: string;
  country: string;
  day: number;
  description: string;
  rating: number;
  image?: string;
};
type FileType = { name: string; size: number; icon: string; variant: string };
type CabinetType = {
  address: string;
  email?: string;
  phone?: string;
  hours?: Record<string, string>;
  isPrimary?: boolean;
};

type TherapistDetailsCardProps = {
  id: string;
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  cabinets?: CabinetType[];
  about?: string;
  languages?: string[];
  paymentMethods?: string[];
  website?: string;
  education?: string[];
  specializations?: string[];
  weeklySessions?: WeeklySessionType[];
  stats?: StatType[];
  transactions?: TransactionType[];
  feedbacks?: FeedbackType[];
  files?: FileType[];
  photo?: string;
  agendaLink?: string | null;
};

const TherapistDetails = ({
  id,
  name,
  jobTitle,
  email,
  phone,
  cabinets = [],
  about,
  languages = [],
  paymentMethods = [],
  website,
  education = [],
  specializations = [],
  weeklySessions = [],
  stats = [],
  transactions = [],
  feedbacks = [],
  files = [],
  photo,
  agendaLink = null,
}: TherapistDetailsCardProps) => {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [cabinetsOpen, setCabinetsOpen] = useState(true);
  const router = useRouter();

  // ✅ Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEditClick = (id: string) => router.push(`/therapists/edit-therapist/${id}`);

  return (
    <div>
      {/* Top Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="link" onClick={() => window.history.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back
        </Button>
        {agendaLink && (
          <Button variant="primary" onClick={() => window.open(agendaLink, '_blank')}>
            Book Appointment
          </Button>
        )}
      </div>

      {/* Profile */}
      <Card className="mb-4 shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={2} className="d-flex justify-content-center">
              {photo && photo !== "null" && photo.trim() !== "" ? (
                <img
                  src={photo}
                  alt={name}
                  className="rounded-circle object-cover"
                  style={{ width: "140px", height: "140px" }}
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
                  {name[0].toUpperCase()}
                </div>
              )}
            </Col>
            <Col lg={10}>
              <div className='d-flex justify-content-between'>
                <h2 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>
                  {name}
                </h2>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleEditClick(id)}
                >
                  <FaEdit className="me-1" /> Edit
                </Button>
              </div>
              <p className="text-muted mb-2">{jobTitle || '-'}</p>
              <div className="d-flex flex-column gap-2">
                {email && (
                  <div className="d-flex align-items-center gap-2">
                    <FaEnvelope className="text-primary" /> <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="d-flex align-items-center gap-2">
                    <FaPhone className="text-success" /> <span>{phone}</span>
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
        </CardBody>
      </Card>

      {/* Branches / Localisation */}
      {cabinets.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <div className="d-flex justify-content-between mb-2">
              <h4>Availability & Branches</h4>
              <Button
                variant="link"
                size="sm"
                onClick={() => setCabinetsOpen(!cabinetsOpen)}
              >
                {cabinetsOpen ? "Hide" : "Show"}
              </Button>
            </div>

            <Collapse in={cabinetsOpen}>
              {/* 👇 Wrap inside a div so Collapse can animate height properly */}
              <div>
                <div className="d-flex gap-3 overflow-auto py-2">
                  {cabinets.map((cab, idx) => (
                    <Card
                      key={idx}
                      className="p-3 flex-shrink-0 shadow-sm"
                      style={{
                        minWidth: "260px",
                        border: cab.isPrimary
                          ? "2px solid #0d6efd"
                          : "1px solid #dee2e6",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {cab.isPrimary && <Badge bg="primary">Primary</Badge>}
                        <FaMapMarkerAlt className="text-danger" />
                        <strong>{cab.address}</strong>
                      </div>

                      {cab.email && (
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FaEnvelope className="text-secondary" /> {cab.email}
                        </div>
                      )}
                      {cab.phone && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <FaPhone className="text-secondary" /> {cab.phone}
                        </div>
                      )}

                      <p className="fw-semibold mb-1">Weekly Hours:</p>
                      <div className="d-flex flex-column gap-1">
                        {cab.hours && Object.keys(cab.hours).length > 0 ? (
                          Object.entries(cab.hours).map(([day, h]) => (
                            <div
                              key={day}
                              className={`d-flex align-items-center gap-2 p-1 rounded ${h.toLowerCase() === "closed"
                                ? "bg-light text-muted"
                                : "bg-primary bg-opacity-10"
                                }`}
                            >
                              <FaClock
                                className={
                                  h.toLowerCase() === "closed"
                                    ? "text-muted"
                                    : "text-primary"
                                }
                              />
                              <strong style={{ width: "80px" }}>{day}:</strong>
                              <span>{h}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted">No hours provided</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Collapse>
          </CardBody>
        </Card>
      )}

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

      {/* Weekly Sessions & Stats */}
      <Card className="mb-4">
        <CardBody>
          <h4>Weekly Sessions & Stats</h4>
          <Row className="g-3">
            {weeklySessions.map((w, idx) => (
              <Col lg={4} key={idx}>
                <Card className="border p-3">
                  <p className="fw-medium fs-15 mb-1">{w.week}</p>
                  <p className="fw-semibold fs-20 mb-0">{w.sessions} sessions</p>
                </Card>
              </Col>
            ))}
            {stats.map((t, idx) => {
              const options = {
                series: [t.progress],
                chart: { type: 'radialBar', height: 90, sparkline: { enabled: true } },
                plotOptions: {
                  radialBar: { hollow: { size: '50%' }, dataLabels: { show: false } },
                },
                colors: [t.variant],
              };
              return (
                <Col lg={4} key={idx}>
                  <Card className="border p-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`avatar bg-${t.variant} bg-opacity-10 rounded flex-centered`}>
                        <IconifyIcon
                          icon={t.icon}
                          width={28}
                          height={28}
                          className={`fs-28 text-${t.variant}`}
                        />
                      </div>
                      <div>
                        <p className="fw-medium fs-15 mb-1">{t.title}</p>
                        <p className="fw-semibold fs-20 mb-0">{t.count}</p>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </CardBody>
      </Card>

      {/* Education & Training */}
      {education.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Education & Training</h4>
            <div className="d-flex flex-wrap gap-2">
              {education.map((edu, i) => (
                <Badge
                  key={i}
                  bg="info"
                  className="fs-13 text-dark d-flex align-items-center px-2 py-1"
                  style={{ cursor: 'pointer' }}
                  title={edu}
                >
                  <IconifyIcon icon="ri:book-line" className="me-1" /> {edu}
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

      {/* Transactions Section */}
      {transactions.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Transactions</h4>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tr, idx) => (
                  <tr key={idx}>
                    <td>{tr.date}</td>
                    <td>{tr.type}</td>
                    <td>${tr.amount.toFixed(2)}</td>
                    <td>
                      <Badge bg={tr.status === 'Completed' ? 'success' : 'warning'}>
                        {tr.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Files / Documents */}
      {files.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Files / Documents</h4>
            <Row className="g-2">
              {files.map((file, idx) => (
                <Col lg={3} key={idx}>
                  <Card className="p-2 d-flex align-items-center gap-2">
                    <IconifyIcon icon={file.icon} className={`text-${file.variant} fs-24`} />
                    <div>
                      <p className="mb-1">{file.name}</p>
                      <p className="mb-0 fs-12">{file.size} MB</p>
                    </div>
                    <IconifyIcon icon="ri:download-cloud-line" className="fs-20 text-muted" />
                  </Card>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      )}

      {/* Feedback / Reviews */}
      {feedbacks.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Reviews / Feedback</h4>
            <Row>
              {feedbacks.map((f, idx) => (
                <Col lg={6} key={idx}>
                  <Card className="bg-light-subtle mb-3">
                    <CardBody>
                      {f.image && (
                        <Image
                          src={f.image}
                          alt="avatar"
                          className="rounded-circle avatar-md mb-2"
                          width={40}
                          height={40}
                        />
                      )}
                      <h5>{f.name}</h5>
                      <p>
                        @{f.userName} ({f.country})
                      </p>
                      <p>{f.description}</p>
                      <p className="text-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IconifyIcon
                            key={i}
                            icon={i < f.rating ? 'ri:star-fill' : 'ri:star-line'}
                          />
                        ))}
                      </p>
                      <p className="text-muted">{f.day} days ago</p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      )}

      {/* Transaction / Appointment History */}
      {transactions.length > 0 && (
        <Card className="mb-4 shadow-sm">
          <CardBody>
            <h4 className="mb-3" style={{ color: '#0d6efd' }}>
              Transactions / Appointments
            </h4>
            <Table responsive striped hover className="mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tr, idx) => (
                  <tr key={idx}>
                    <td>{tr.date}</td>
                    <td>{tr.type}</td>
                    <td>${tr.amount.toFixed(2)}</td>
                    <td>
                      <Badge
                        bg={
                          tr.status === 'Completed'
                            ? 'success'
                            : tr.status === 'Pending'
                              ? 'warning'
                              : 'secondary'
                        }
                        className="py-1 px-2"
                      >
                        {tr.status}
                      </Badge>
                    </td>
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

export default TherapistDetails;
