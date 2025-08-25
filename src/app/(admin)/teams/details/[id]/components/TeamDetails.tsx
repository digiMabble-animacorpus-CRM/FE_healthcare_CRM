'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Card, CardBody, Col, Row, Button, Badge, Collapse, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { FaClock, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

type FAQItem = { question: string; answer: string };
type CabinetType = {
  address: string;
  email?: string;
  phone?: string;
  hours?: Record<string, string>;
  isPrimary?: boolean;
};
type FileType = { name: string; size: number; icon: string; variant: string };
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

type TeamDetailsCardProps = {
  team_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  job_1?: string | null;
  job_2?: string | null;
  job_3?: string | null;
  job_4?: string | null;
  specific_audience?: string | null;
  specialization?: string | null;
  who_am_i: string;
  consultations: string;
  office_address: string;
  contact_email: string;
  contact_phone: string;
  schedule: { text: string | null };
  about: string;
  languages_spoken: string[];
  payment_methods: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
  frequently_asked_questions: FAQItem[];
  calendar_links: string[];
  photo: string;  
  cabinets?: CabinetType[];
  weeklySessions?: WeeklySessionType[];
  stats?: StatType[];
  transactions?: TransactionType[];
  feedbacks?: FeedbackType[];
  files?: FileType[];
  agendaLink?: string | null;
};

const TeamDetails = ({
  first_name,
  last_name,
  full_name,
  job_1,
  job_2,
  job_3,
  job_4,
  specific_audience,
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
}: TeamDetailsCardProps) => {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [setWhoIAmOpen,WhoIAmOpen] = useState(true);
  const [consultationOpen, setAConsultationOpen] = useState(true);
  const [specificAudienceOpen, setSpecificAudienceOpen] = useState(true);

  const photoUrl = photo?.match(/^https?:\/\//) ? photo : '/placeholder-avatar.jpg';

  const options: ApexOptions = {
    chart: { type: 'radialBar', height: 90, sparkline: { enabled: true } },
    plotOptions: { radialBar: { hollow: { size: '50%' }, dataLabels: { show: false } } },
    colors: ['#0d6efd'],
  };


  return (
    <div>
      {/* Top Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => window.history.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back
        </Button>
      </div>

      {/* Profile / Avatar */}
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
            <Col lg={8}>
              <h2 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>
                {full_name}
              </h2>
              <p className="text-muted mb-2">{job_1 || '-'}</p>
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
                    <FaMapMarkerAlt className="text-warning" />{' '}
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

      {/* Education & Training */}
      {diplomas_and_training.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Education & Training</h4>
            <div className="d-flex flex-wrap gap-2">
              {diplomas_and_training.map((edu, i) => (
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

      {/* Payment Methods */}
      {payment_methods.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Payment Methods</h4>
            <div className="d-flex flex-wrap gap-2">
              {payment_methods.map((spec, i) => (
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
            <h4>Consultation</h4>
            <Button variant="link" size="sm" onClick={() => setAConsultationOpen(!consultationOpen)}>
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
            <Button variant="link" size="sm" onClick={() => setSpecificAudienceOpen(!specificAudienceOpen)}>
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
          <div className="d-flex justify-content-between mb-2">
            <h4>Who I Am</h4>          
          </div>
            <div>
              <p>{who_am_i || '-'}</p>
            </div>
        </CardBody>
      </Card>

      {/* Calendar Links */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between mb-2">
            <h4>Calendar Links</h4>          
          </div>
            <div>
              <p>{calendar_links || '-'}</p>
            </div>
        </CardBody>
      </Card>

      {/* FAQ */}
      {frequently_asked_questions.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h4>Transactions</h4>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>                  
                </tr>
              </thead>
              <tbody>
                {frequently_asked_questions.map((tr, idx) => (
                  <tr key={idx}>
                    <td>{tr.question}</td>
                    <td>{tr.answer}</td>                 
                    
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
