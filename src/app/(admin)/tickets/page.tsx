'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Spinner,
  Badge,
} from 'react-bootstrap';
// import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { API_BASE_PATH } from '@/context/constants';

// --- Types ---
type TicketType = {
  id: number;
  description: string;
  is_for_child: boolean;
  child_name: string | null;
  child_age: number;
  location: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  first_name: string;
  last_name: string;
  status?: string;
};

const TicketPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  // Relative Date Formatter 
  const formatRequestDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    }) + ' – ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/new-requests-appointment-management`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.new_requests || response.data || [];
      setTickets(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary text-white p-2 rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
          <IconifyIcon icon="mdi:calendar-check" className="fs-24" />
        </div>
        <div>
          <h4 className="mb-0 fw-bold">Appointment Requests</h4>
          <p className="text-muted mb-0 small">Manage new, cancelled, and rescheduled appointments</p>
        </div>
      </div>

      {/* KPI Stats [cite: 258-262] */}
      <Row className="mb-4 g-3 text-center">
        {['Pending', 'New Request', 'Cancellation', 'Reschedule'].map((label, i) => (
          <Col key={i} xs={6} md={3}>
            <Card className="border-0 shadow-sm py-3 rounded-3">
              <h3 className="fw-bold mb-0 text-dark">{i === 0 ? tickets.length : (i === 1 ? 2 : (i === 2 ? 2 : 1))}</h3>
              <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>{label}</small>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {tickets.map((t) => (
            <Card key={t.id} className="border-0 shadow-sm overflow-hidden rounded-3 border-start border-4 border-primary">
              <CardBody className="p-4">
                <Row>
                  <Col md={8}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                        <IconifyIcon icon="mdi:account" className="fs-24 text-secondary" />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="mb-0 fw-bold">{t.first_name} {t.last_name}</h6>
                          <Badge pill bg="success-subtle" className="text-success fw-normal border border-success px-2">
                             New Request
                          </Badge>
                        </div>
                        
                        {/* Conditional Child Name Display */}
                        {t.is_for_child && (
                          <div className="text-primary small mb-1 fw-bold">
                            <IconifyIcon icon="mdi:face-child" className="me-1" />
                            Child: {t.child_name} ({t.child_age} years)
                          </div>
                        )}

                        <div className="text-muted small mb-1">
                          <IconifyIcon icon="mdi:phone" className="me-1" /> {t.phone}
                        </div>

                        {/* Conditional Email Display */}
                        {t.email && (
                          <div className="text-muted small mb-1">
                            <IconifyIcon icon="mdi:email-outline" className="me-1" /> {t.email}
                          </div>
                        )}

                        <div className="text-muted small">
                          <IconifyIcon icon="mdi:map-marker" className="me-1" /> {t.location}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col md={4} className="text-end">
                    <div className="text-muted small d-flex align-items-center justify-content-end gap-1 mb-2">
                      <IconifyIcon icon="mdi:calendar-clock" className="text-primary" />
                      <span className="fw-medium">Requested date: {formatRequestDate(t.created_at)}</span>
                    </div>
                    <Badge pill bg="primary-subtle" className="text-primary border border-primary-subtle px-3 py-2 fw-medium mb-1">
                      {t.specialty}
                    </Badge>
                  </Col>
                </Row>

                {/* AI Summary Block [cite: 81-89, 223-231] */}
                <div className="rounded-3 p-3 mt-4 mb-3 d-flex align-items-start gap-3 border shadow-sm" style={{ backgroundColor: '#fcfbff' }}>
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '28px', height: '28px' }}>
                    <IconifyIcon icon="mdi:creation" className="fs-16" />
                  </div>
                  <p className="mb-0 text-dark small py-1 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <Button variant="outline-danger" className="rounded-pill px-3 btn-sm border-0 fw-semibold">
                    Decline
                  </Button>
                  <Button variant="primary" className="rounded-pill px-4 btn-sm d-flex align-items-center gap-2 fw-semibold shadow-sm border-0">
                    Approve
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketPage;