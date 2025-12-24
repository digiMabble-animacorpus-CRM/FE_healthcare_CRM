'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Spinner,
  Badge,
  Form,
  Dropdown,
  Container
} from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useNotificationContext } from '@/context/useNotificationContext';
import PatientFormModal from '../patients/components/PatientFormModal';
import { getAllPatient } from '@/helpers/patient';

/**
 * TYPES
 */
type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  contactInfos: { type: string; value: string }[];
};

type CallType = {
  call_id: string;
  agent_name?: string;
  from_number?: string;
  start_timestamp?: number;
  duration_ms?: number;
  transcript?: string;
  call_analysis?: {
    call_summary?: string;
  };
  urgency: 'Urgent' | 'Medium' | 'Normal';
  callTypeLabel: 'New appt' | 'Cancellation' | 'Information' | 'Other';
  suggestedAction: string;
  isNewPatient: boolean;
  [k: string]: any;
};

const PATIENT_LIMIT = 2000;
const RETELL_LIST_ENDPOINT = 'https://api.retellai.com/v2/list-calls';

const normalizePhone = (phone: string) => phone?.replace(/\s+/g, '').replace('+', '') || '';

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
  return `${date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
};

const CallerListPage = () => {
  const [calls, setCalls] = useState<CallType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');

  const [showPatientModal, setShowPatientModal] = useState(false);
  const { showNotification } = useNotificationContext();

  const isWithinTimeRange = (timestamp?: number, range: string = 'All') => {
    if (!timestamp || range === 'All') return true;
    const date = new Date(timestamp);
    const now = new Date();

    if (range === 'Today') return date.toDateString() === now.toDateString();
    if (range === 'This week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    if (range === 'This month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const fetchAllPatientsInternal = async (): Promise<Patient[]> => {
    let allPatients: Patient[] = [];
    let page = 1;
    let hasNextPage = true;
    try {
      while (hasNextPage) {
        const response = await getAllPatient(page, PATIENT_LIMIT);
        allPatients.push(...(response?.data ?? []));
        hasNextPage = response?.hasNextPage;
        page++;
      }
    } catch (error) { console.error("Patient sync failed", error); }
    return allPatients;
  };

  const enrichCall = (c: any, patients: Patient[]): CallType => {
    const text = (c.transcript || '').toLowerCase();
    const summary = (c.call_analysis?.call_summary || '').toLowerCase();
    const fullText = text + " " + summary;

    let extractedName = '';
    const crmTool = c.tool_calls?.find((t: any) => t.name === 'create_crm_ticket');
    if (crmTool?.arguments) {
      try {
        const args = typeof crmTool.arguments === 'string' ? JSON.parse(crmTool.arguments) : crmTool.arguments;
        extractedName = `${args.First_name || ''} ${args.Last_name || ''}`.trim();
      } catch (e) { }
    }

    const phone = normalizePhone(c.from_number);
    const match = patients.find(p =>
      p.contactInfos?.some(i => normalizePhone(i.value) === phone) ||
      (extractedName && `${p.firstName} ${p.lastName}`.toLowerCase().includes(extractedName.toLowerCase()))
    );

    let urgency: 'Urgent' | 'Medium' | 'Normal' = 'Normal';
    if (/\b(douleur|urgence|grave|sévère|immédiat|accident)\b/.test(fullText)) urgency = 'Urgent';
    else if (/\b(vite|rapidement|souffre|malade)\b/.test(fullText)) urgency = 'Medium';

    let type: any = 'Other';
    let action = 'Offer a slot this week';
    if (/\b(annuler|annulation|décommander|reporté)\b/.test(fullText)) {
      type = 'Cancellation';
      action = 'Remove from calendar';
    } else if (/\b(rendez-vous|réserver|acupuncture|nouveau|disponibilité)\b/.test(fullText) || crmTool) {
      type = 'New appt';
      action = 'Offer a slot this week';
    } else if (/\b(info|horaire|question|renseignement)\b/.test(fullText)) {
      type = 'Information';
      action = 'Provide standard info';
    }

    return {
      ...c,
      agent_name: match ? `${match.firstName} ${match.lastName}` : (extractedName || `Contact #TMP-${phone.slice(-4)}`),
      urgency,
      callTypeLabel: type,
      suggestedAction: action,
      isNewPatient: !match
    };
  };

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const patientList = await fetchAllPatientsInternal();
      const apiKey = getRetellApiKey();
      const response = await axios.post(RETELL_LIST_ENDPOINT, { limit: 50 }, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      });
      const items = Array.isArray(response.data) ? response.data : (response.data.calls || []);
      setCalls(items.map((c: any) => enrichCall(c, patientList)));
    } catch (err) {
      showNotification?.({ message: 'Error loading data.', variant: 'danger' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCalls(); }, []);

  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const matchesSearch = c.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.from_number?.includes(searchTerm);
      const matchesUrgency = urgencyFilter === 'All' || c.urgency === urgencyFilter;
      const matchesCategory = categoryFilter === 'All' || c.callTypeLabel === categoryFilter;
      const matchesTime = isWithinTimeRange(c.start_timestamp, timeFilter);
      return matchesSearch && matchesUrgency && matchesCategory && matchesTime;
    });
  }, [calls, searchTerm, urgencyFilter, categoryFilter, timeFilter]);

  const stats = useMemo(() => ({
    All: calls.length,
    Urgent: calls.filter(c => c.urgency === 'Urgent').length,
    Medium: calls.filter(c => c.urgency === 'Medium').length,
    Normal: calls.filter(c => c.urgency === 'Normal').length,
  }), [calls]);

  const categoryCounts = useMemo(() => {
    const base = calls.filter(c =>
      (urgencyFilter === 'All' || c.urgency === urgencyFilter) &&
      isWithinTimeRange(c.start_timestamp, timeFilter)
    );
    return {
      All: base.length,
      'New appt': base.filter(c => c.callTypeLabel === 'New appt').length,
      'Cancellation': base.filter(c => c.callTypeLabel === 'Cancellation').length,
      'Information': base.filter(c => base.filter(c => c.callTypeLabel === 'Information').length).length,
      'Other': base.filter(c => c.callTypeLabel === 'Other').length,
    };
  }, [calls, urgencyFilter, timeFilter]);

  return (
    <Container fluid className="p-3 p-md-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="mb-4">
        <h4 className="mb-0 fw-bold">Calls — Animus Voice</h4>
        <p className="text-muted mb-0 small">Intelligently classified call history</p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <Row className="mb-4">
        {[
          { label: 'All', value: stats.All, color: 'text-dark' },
          { label: 'Urgent', value: stats.Urgent, color: 'text-danger' },
          { label: 'Medium', value: stats.Medium, color: 'text-warning' },
          { label: 'Normal', value: stats.Normal, color: 'text-success' },
        ].map((s, idx) => {
          const isActive = urgencyFilter === s.label;
          return (
            <Col key={idx} xs={6} lg={3} className="mb-3">
              <Card
                className="border-0 shadow-sm text-center py-2 rounded-3 mb-0 transition-all"
                style={{
                  cursor: 'pointer',
                  border: isActive ? '2px solid #6f42c1' : '2px solid transparent',
                }}
                onClick={() => setUrgencyFilter(s.label)}
              >
                <CardBody className="d-flex flex-column justify-content-center">
                  <h2 className={`fw-bold mb-0 ${s.color}`}>{s.value}</h2>
                  <span className="text-muted small fw-medium">{s.label}</span>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* FILTER BAR */}
      <Row className="mb-4 g-3 align-items-center">
        {/* Left Side: Search and Time Filter */}
        <Col xs={12} lg={4}>
          <div className="d-flex gap-2 align-items-center">
            {/* Search Input */}
            <div className="input-group input-group-merge bg-white rounded-2 border px-3 py-2 shadow-sm flex-grow-1">
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

            {/* Time Filter Dropdown */}
            <Dropdown onSelect={(e: any) => setTimeFilter(e)} className="flex-shrink-0">
              <Dropdown.Toggle
                variant="link"
                className="text-dark bg-white border shadow-sm px-3 py-2 rounded-2 text-decoration-none d-flex align-items-center"
              >
                <IconifyIcon icon="mdi:filter-variant" className="me-2" />
                <span>{timeFilter === 'All' ? 'Filter' : timeFilter}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm border-0 py-2">
                {['Today', 'This week', 'This month', 'All'].map((option) => (
                  <Dropdown.Item
                    key={option}
                    eventKey={option}
                    className={`d-flex align-items-center justify-content-between py-2 ${
                      timeFilter === option ? 'bg-light fw-bold text-primary' : ''
                    }`}
                  >
                    {option === 'All' ? 'All Time' : option}
                    {timeFilter === option && <IconifyIcon icon="mdi:check" className="text-primary ms-2" />}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>

        {/* Right Side: Category Tabs */}
        <Col xs={12} lg={8}>
          <div className="d-flex justify-content-start justify-content-lg-end">
            <div 
              className="category-scroll d-flex gap-2 pb-1 overflow-auto w-100 justify-content-start justify-content-lg-end"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {['All', 'New appt', 'Cancellation', 'Information', 'Other'].map((cat) => (
                <Button
                  key={cat}
                  variant="link"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-pill px-3 py-1 text-decoration-none border shadow-sm flex-shrink-0 transition-all ${
                    categoryFilter === cat
                      ? 'bg-primary-subtle border-primary-subtle text-primary fw-bold'
                      : 'bg-white border-light text-dark fw-medium'
                  }`}
                  style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {cat} <span className="ms-1 opacity-75">({(categoryCounts as any)[cat] || 0})</span>
                </Button>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* CALL LIST */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredCalls.map((c) => (
            <Card key={c.call_id} className={`border-0 shadow-sm rounded-3 border-start border-4 ${c.urgency === 'Urgent' ? 'border-danger' : c.urgency === 'Medium' ? 'border-warning' : 'border-primary'}`}>
              <CardBody className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                  <div className="d-flex align-items-center gap-2 gap-md-3">
                    <div className="bg-light rounded-circle d-none d-sm-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                      <IconifyIcon icon="mdi:account-outline" className="fs-24 text-secondary" />
                    </div>
                    <div>
                      <div className='d-flex gap-2'>
                        <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '180px' }}>
                          {c.agent_name}
                        </h6>
                        <Badge bg={c.isNewPatient ? "warning-subtle" : "success-subtle"} className={`${c.isNewPatient ? "text-warning" : "text-success"} d-block d-sm-inline-block mt-1 mt-sm-0 ms-sm-2 fw-normal rounded-pill border small`}>
                          {c.isNewPatient ? "New" : "Matched"}
                        </Badge>
                      </div>
                      <div className="text-muted small mt-1">{c.from_number}</div>
                    </div>
                  </div>
                  <Badge pill bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1 px-md-3 py-md-2 fw-normal shadow-sm d-flex align-items-center flex-shrink-0">
                   {c.callTypeLabel}
                    
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="text-muted small">
                    <IconifyIcon icon="mdi:clock-outline" className="me-1" /> {formatDate(c.start_timestamp)}
                  </div>
                  <Badge bg={c.urgency === 'Urgent' ? 'danger-subtle' : c.urgency === 'Medium' ? 'warning-subtle' : 'info-subtle'} className={`${c.urgency === 'Urgent' ? 'text-danger' : c.urgency === 'Medium' ? 'text-warning' : 'text-info'} rounded-pill px-2 py-1 text-uppercase x-small`}>
                    {c.urgency}
                  </Badge>
                </div>

                <div className="rounded-3 p-2 p-md-3 mb-3 d-flex gap-2 gap-md-3" style={{ backgroundColor: '#f5f3ff' }}>
                  <IconifyIcon icon="mdi:auto-fix" className="text-primary mt-1 flex-shrink-0" />
                  <div className="small">
                    <strong className="text-primary d-block mb-1">Summary</strong>
                    <p className="mb-0 text-dark opacity-75">{c.call_analysis?.call_summary || "No summary."}</p>
                  </div>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 border-top gap-3">
                  <div className="small">
                    <span className="text-muted">Action:</span> <strong className="ms-1 text-dark">{c.suggestedAction}</strong>
                  </div>
                  <div className="d-flex gap-2">
                    {c.isNewPatient && (
                      <Button variant="outline-primary" className="rounded-2 px-3 btn-sm flex-fill" onClick={() => setShowPatientModal(true)}>
                        Create Patient
                      </Button>
                    )}
                    <Button variant="primary" className="rounded-2 px-4 fw-semibold d-flex align-items-center justify-content-center gap-2 btn-sm flex-fill" style={{ backgroundColor: '#6f42c1', border: 'none' }}>
                      Process <IconifyIcon icon="mdi:arrow-right" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {!loading && filteredCalls.length === 0 && (
            <div className="text-center py-5">
              <IconifyIcon icon="mdi:clipboard-text-search-outline" className="fs-48 text-muted mb-2" />
              <h5 className="text-muted">No calls found</h5>
              <Button variant="link" className="small" onClick={() => { setTimeFilter('All'); setUrgencyFilter('All'); setCategoryFilter('All'); }}>Reset Filters</Button>
            </div>
          )}
        </div>
      )}

      <PatientFormModal show={showPatientModal} mode="create" onClose={() => setShowPatientModal(false)} onSaved={fetchCalls} />

      <style jsx>{`
        .transition-all { transition: all 0.2s ease-in-out; }
        .input-group-text { border: none; }
        .form-control:focus { box-shadow: none; }
        .category-scroll::-webkit-scrollbar { display: none; }
        .category-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .x-small { font-size: 0.7rem; }
        @media (max-width: 576px) {
          h2 { font-size: 1.5rem; }
          .p-4 { padding: 1rem !important; }
        }
      `}</style>
    </Container>
  );
};

export default CallerListPage;