'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Spinner,
  Badge,
  Form,
  ButtonGroup,
  Modal,
} from 'react-bootstrap';

// Components & Context
// import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useNotificationContext } from '@/context/useNotificationContext';

/**
 * TYPES & CONSTANTS
 */
type CallType = {
  call_id: string;
  agent_name?: string;
  call_status?: string;
  start_timestamp?: number;
  duration_ms?: number;
  from_number?: string;
  to_number?: string;
  disconnection_reason?: string;
  recording_url?: string;
  recording_duration_ms?: number;
  transcript?: string;
  transcript_object?: any[];
  call_cost?: {
    combined_cost?: number;
  };
  call_analysis?: {
    user_sentiment?: string;
    call_summary?: string;
    call_successful?: boolean;
  };
  latency?: {
    e2e?: { p50?: number };
  };
  [k: string]: any;
};

const PAGE_LIMIT = 1000;
const RETELL_LIST_ENDPOINT = 'https://api.retellai.com/v2/list-calls';
const RETELL_GET_ENDPOINT = 'https://api.retellai.com/v2/get-call';

/**
 * HELPER FUNCTIONS
 */
const getRetellApiKey = () => {
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem('retell_api_key');
    if (fromStorage) return fromStorage;
  }
  return process.env.NEXT_PUBLIC_RETELL_API_KEY || 'key_1d964c4ebd944cdf5f7c9af67b12';
};

const formatDate = (ms?: number) => {
  if (!ms) return '-';

  const date = new Date(ms);
  const now = new Date();

  // Set time to midnight for "today" and "yesterday" comparison
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(todayMidnight.getDate() - 1);

  const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Format the time part (e.g., 2:32 PM)
  const timeStr = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });

  // If today
  if (targetMidnight.getTime() === todayMidnight.getTime()) {
    return `Today, ${timeStr}`;
  }

  // If yesterday
  if (targetMidnight.getTime() === yesterdayMidnight.getTime()) {
    return `Yesterday, ${timeStr}`;
  }

  // Else: "Day, Date & Time" (e.g., Monday, 10 Nov, 9:21 AM)
  const dayDateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  return `${dayDateStr}, ${timeStr}`;
};

const msToHMS = (ms?: number) => {
  if (!ms && ms !== 0) return '-';
  const totalSeconds = Math.round(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`.trim() || '0s';
};

/**
 * MAIN COMPONENT
 */
const CallerListPage = () => {
  const [calls, setCalls] = useState<CallType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  // Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [callDetail, setCallDetail] = useState<CallType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { showNotification } = useNotificationContext();

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const apiKey = getRetellApiKey();
      const response = await axios.post(
        RETELL_LIST_ENDPOINT,
        { limit: PAGE_LIMIT },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      const items = Array.isArray(data) ? data : data.calls || data.data || [];
      console.log(data, "data")
      setCalls(
        items.map((c: any) => ({
          ...c,
          call_id: c.call_id ?? c.id,
          agent_name: c.agent_name ?? 'Contact #TMP-' + Math.floor(Math.random() * 9000),
          start_timestamp: c.start_timestamp ?? c.start_time,
          duration_ms: c.duration_ms ?? c.duration,
          from_number: c.from_number ?? c.from,
          to_number: c.to_number ?? c.to,
        }))
      );
    } catch (err) {
      console.error('Fetch error:', err);
      showNotification?.({
        message: 'Loading sample data due to API error.',
        variant: 'warning',
      });
      // Sample data for UI demonstration if API fails
      setCalls([{
        call_id: 'sample-1',
        agent_name: 'Laureline Amerio',
        from_number: '06 12 34 56 78',
        start_timestamp: Date.now(),
        call_analysis: {
          call_summary: "Marie would like to schedule an appointment with Dr. Martin for physiotherapy sessions. She is available on Tuesdays and Thursdays afternoons."
        }
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const openDetailModal = async (callId: string) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const apiKey = getRetellApiKey();
      const res = await axios.get(`${RETELL_GET_ENDPOINT}/${callId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      setCallDetail(res.data);
    } catch (err) {
      showNotification?.({ message: 'Error fetching details', variant: 'danger' });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Area */}
      <div className="d-flex align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Calls — Animus Voice</h4>
          <p className="text-muted mb-0 small">All calls handled by Animus, intelligently classified</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Row className="mb-4 align-items-center">
        <Col lg={4} md={6}>
          <div className="input-group input-group-merge bg-white rounded-pill border px-3 py-1 shadow-sm">
            <span className="input-group-text bg-transparent border-0 p-0 me-2">
              <IconifyIcon icon="mdi:magnify" className="text-muted fs-20" />
            </span>
            <Form.Control
              className="border-0 shadow-none p-0"
              placeholder="Search a call..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col lg={8} md={6} className="d-flex justify-content-md-end mt-3 mt-md-0 gap-2">
          <Button variant="outline-secondary" className="rounded-pill bg-white border shadow-sm px-3">
            <IconifyIcon icon="mdi:filter-variant" className="me-1" /> Filter
          </Button>
          <ButtonGroup className="bg-white rounded-pill shadow-sm p-1 border">
            {['All', 'New appt', 'Cancellation', 'Information', 'Other'].map((btn) => (
              <Button
                key={btn}
                variant={filter === btn ? 'primary' : 'link'}
                className={`rounded-pill border-0 px-3 btn-sm text-decoration-none ${filter === btn ? '' : 'text-dark'}`}
                onClick={() => setFilter(btn)}
              >
                {btn}
              </Button>
            ))}
          </ButtonGroup>
        </Col>
      </Row>

      {/* KPI Stats Grid */}
      <Row className="mb-4 g-3">
        {[
          { label: 'Today', value: '7', color: 'text-dark' },
          { label: 'Urgent', value: '2', color: 'text-danger' },
          { label: 'Pending', value: '3', color: 'text-info' },
          { label: 'This week', value: '23', color: 'text-success' },
        ].map((stat, i) => (
          <Col key={i} xs={6} md={3}>
            <Card className="border-0 shadow-sm text-center py-3 rounded-3">
              <h3 className={`fw-bold mb-0 ${stat.color}`}>{stat.value}</h3>
              <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px' }}>{stat.label}</small>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Dynamic List of Calls */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {calls.map((c, idx) => (
            <Card key={c.call_id || idx} className="border-0 shadow-sm overflow-hidden rounded-3 border-start border-4 border-danger">
              <CardBody className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                      <IconifyIcon icon="mdi:account" className="fs-24 text-secondary" />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">
                        {c.agent_name}
                        <Badge bg="success-subtle" className="text-success ms-2 fw-normal rounded-pill border border-success">
                          <IconifyIcon icon="mdi:check-circle" className="me-1" /> Matched patient
                        </Badge>
                      </h6>
                      <small className="text-muted fw-medium">{c.from_number}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    {/* Call Type Badge (e.g., New Appointment) */}
                    <Badge
                      pill
                      bg="primary-subtle"
                      className="text-primary border border-primary-subtle px-3 py-2 fw-medium mb-1"
                    >
                      <IconifyIcon icon="mdi:calendar-plus" className="me-1" />
                      New Appointment
                    </Badge>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="text-muted small">
                    <IconifyIcon icon="mdi:clock-outline" className="me-1" /> {formatDate(c.end_timestamp)}
                  </div>
                  <div>
                    <Badge
                      pill
                      bg="danger-subtle"
                      className="text-danger border border-danger-subtle px-2 py-1 mb-1 fw-bold text-uppercase tracking-wider"
                      style={{ fontSize: '10px' }}
                    >
                      Urgent
                    </Badge>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="rounded-3 p-3 mb-3 d-flex gap-3" style={{ backgroundColor: '#f3f0ff' }}>
                  <div className="text-primary mt-1">
                    <IconifyIcon icon="mdi:creation" className="fs-20" />
                  </div>
                  <div>
                    <strong className="text-primary d-block mb-1 small">Summary by Animus</strong>
                    <p className="mb-0 text-dark small leading-relaxed">
                      {c.call_analysis?.call_summary || "Call summary being generated..."}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <div className="small">
                    <span className="text-muted">Suggested action :</span> <strong className="ms-1">Offer a slot this week</strong>
                  </div>
                  <Button
                    variant="primary"
                    className="rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold"
                    onClick={() => openDetailModal(c.call_id)}
                  >
                    Process <IconifyIcon icon="mdi:arrow-right" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          {!loading && calls.length === 0 && (
            <div className="text-center py-5 text-muted">No calls found.</div>
          )}
        </div>
      )}

      {/* Standard Bootstrap Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Call Insights</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : callDetail ? (
            <div>
              <Row className="mb-4">
                <Col sm={6}><strong>Duration:</strong> {msToHMS(callDetail.duration_ms)}</Col>
                <Col sm={6}><strong>Status:</strong> {callDetail.call_status}</Col>
              </Row>
              <h6 className="fw-bold mb-2">Transcript</h6>
              <div className="bg-light p-3 rounded small" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {callDetail.transcript || "Transcript not available."}
              </div>
            </div>
          ) : <p>Error loading details.</p>}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* CSS Overrides */}
      <style jsx>{`
        .input-group-text { border: none; }
        .form-control:focus { box-shadow: none; }
        .tracking-wider { letter-spacing: 0.05em; }
        .leading-relaxed { line-height: 1.5; }
      `}</style>
    </div>
  );
};

export default CallerListPage;