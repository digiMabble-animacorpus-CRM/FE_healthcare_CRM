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
  Container,
  Modal
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
    call_successful?: boolean;
    user_sentiment?: string;
  };
  urgency: 'Urgent' | 'Medium' | 'Normal';
  callTypeLabel: 'Nouveau RDV' | 'Annulation' | 'Information' | 'Autre';
  suggestedAction: string;
  isNewPatient: boolean;
  [k: string]: any;
};

const PATIENT_LIMIT = 2000;
const RETELL_LIST_ENDPOINT = 'https://api.retellai.com/v2/list-calls';
const RETELL_GET_ENDPOINT = 'https://api.retellai.com/v2/get-call';

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
  return `${date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}`;
};

const msToHMS = (ms?: number) => {
  if (!ms && ms !== 0) return '-';
  const totalSeconds = Math.round((ms || 0) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`.trim() || '0s';
};


const CallerListPage = () => {
  const [calls, setCalls] = useState<CallType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [urgencyFilter, setUrgencyFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [timeFilter, setTimeFilter] = useState('Tous');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [callDetail, setCallDetail] = useState<CallType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  console.log(callDetail)

  const [showPatientModal, setShowPatientModal] = useState(false);
  const { showNotification } = useNotificationContext();

  const isWithinTimeRange = (timestamp?: number, range: string = 'Tous') => {
    if (!timestamp || range === 'Tous') return true;
    const date = new Date(timestamp);
    const now = new Date();

    if (range === "Aujourd'hui") return date.toDateString() === now.toDateString();
    if (range === 'Cette semaine') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    if (range === 'Ce mois-ci') {
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
    } catch (error) { console.error("Échec sync patients", error); }
    return allPatients;
  };

  const openDetailModal = async (callId: string) => {
    setSelectedCallId(callId);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const apiKey = getRetellApiKey();
      const response = await axios.get(`${RETELL_GET_ENDPOINT}/${callId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      setCallDetail(response.data);
    } catch (err) {
      console.error('Failed to fetch call detail', err);
      showNotification?.({
        message: "Échec de la récupération du détail de l'appel.",
        variant: 'danger',
      });
      setCallDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCallId(null);
    setCallDetail(null);
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

    let urgency: any = 'Normal';
    if (/\b(douleur|urgence|grave|sévère|immédiat|accident)\b/.test(fullText)) urgency = 'Urgent';
    else if (/\b(vite|rapidement|souffre|malade)\b/.test(fullText)) urgency = 'Medium';

    let type: any = 'Autre';
    let action = 'Proposer un créneau cette semaine';
    if (/\b(annuler|annulation|décommander|reporté)\b/.test(fullText)) {
      type = 'Annulation';
      action = 'Supprimer du calendrier';
    } else if (/\b(rendez-vous|réserver|acupuncture|nouveau|disponibilité)\b/.test(fullText) || crmTool) {
      type = 'Nouveau RDV';
      action = 'Proposer un créneau cette semaine';
    } else if (/\b(info|horaire|question|renseignement)\b/.test(fullText)) {
      type = 'Information';
      action = 'Fournir les infos standard';
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
      showNotification?.({ message: 'Erreur lors du chargement des données.', variant: 'danger' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCalls(); }, []);

  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const matchesSearch = c.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.from_number?.includes(searchTerm);
      const translatedUrgency = c.urgency === 'Medium' ? 'Moyen' : c.urgency;
      const matchesUrgency = urgencyFilter === 'Tous' || translatedUrgency === urgencyFilter;
      const matchesCategory = categoryFilter === 'Tous' || c.callTypeLabel === categoryFilter;
      const matchesTime = isWithinTimeRange(c.start_timestamp, timeFilter);
      return matchesSearch && matchesUrgency && matchesCategory && matchesTime;
    });
  }, [calls, searchTerm, urgencyFilter, categoryFilter, timeFilter]);

  const stats = useMemo(() => ({
    Tous: calls.length,
    Urgent: calls.filter(c => c.urgency === 'Urgent').length,
    Moyen: calls.filter(c => c.urgency === 'Medium').length,
    Normal: calls.filter(c => c.urgency === 'Normal').length,
  }), [calls]);

  const categoryCounts = useMemo(() => {
    const base = calls.filter(c =>
      (urgencyFilter === 'Tous' || (c.urgency === 'Medium' ? 'Moyen' : c.urgency) === urgencyFilter) &&
      isWithinTimeRange(c.start_timestamp, timeFilter)
    );
    return {
      Tous: base.length,
      'Nouveau RDV': base.filter(c => c.callTypeLabel === 'Nouveau RDV').length,
      'Annulation': base.filter(c => c.callTypeLabel === 'Annulation').length,
      'Information': base.filter(c => c.callTypeLabel === 'Information').length,
      'Autre': base.filter(c => c.callTypeLabel === 'Autre').length,
    };
  }, [calls, urgencyFilter, timeFilter]);

  return (
    <Container fluid className="p-3 p-md-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="mb-4">
        <h4 className="mb-0 fw-bold">Appels — Animus Voice</h4>
        <p className="text-muted mb-0 small">Historique des appels classé intelligemment</p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <Row className="mb-4">
        {[
          { label: 'Tous', value: stats.Tous, color: 'text-dark' },
          { label: 'Urgent', value: stats.Urgent, color: 'text-danger' },
          { label: 'Moyen', value: stats.Moyen, color: 'text-warning' },
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
        <Col xs={12} lg={4}>
          <div className="d-flex gap-2 align-items-center">
            <div className="input-group input-group-merge bg-white rounded-2 border px-3 py-2 shadow-sm flex-grow-1">
              <span className="input-group-text bg-transparent border-0 p-0 me-2">
                <IconifyIcon icon="mdi:magnify" className="text-muted fs-20" />
              </span>
              <Form.Control
                className="border-0 shadow-none p-0"
                placeholder="Rechercher un appel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Dropdown onSelect={(e: any) => setTimeFilter(e)} className="flex-shrink-0">
              <Dropdown.Toggle
                variant="link"
                className="text-dark bg-white border shadow-sm px-3 py-2 rounded-2 text-decoration-none d-flex align-items-center"
              >
                <IconifyIcon icon="mdi:filter-variant" className="me-2" />
                <span>{timeFilter === 'Tous' ? 'Filtrer' : timeFilter}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm border-0 py-2">
                {["Aujourd'hui", 'Cette semaine', 'Ce mois-ci', 'Tous'].map((option) => (
                  <Dropdown.Item
                    key={option}
                    eventKey={option}
                    className={`d-flex align-items-center justify-content-between py-2 ${timeFilter === option ? 'bg-light fw-bold text-primary' : ''
                      }`}
                  >
                    {option === 'Tous' ? 'Tout le temps' : option}
                    {timeFilter === option && <IconifyIcon icon="mdi:check" className="text-primary ms-2" />}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>

        <Col xs={12} lg={8}>
          <div className="d-flex justify-content-start justify-content-lg">
            <div
              className="category-scroll d-flex gap-2 pb-1 overflow-auto justify-content-start"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {['Tous', 'Nouveau RDV', 'Annulation', 'Information', 'Autre'].map((cat) => (
                <Button
                  key={cat}
                  variant="link"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-pill px-3 py-1 text-decoration-none border shadow-sm flex-shrink-0 transition-all ${categoryFilter === cat
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
                          {c.isNewPatient ? "Nouveau" : "Correspondance"}
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
                    {c.urgency === 'Medium' ? 'MOYEN' : c.urgency}
                  </Badge>
                </div>

                <div className="rounded-3 p-2 p-md-3 mb-3 d-flex gap-2 gap-md-3" style={{ backgroundColor: '#f5f3ff' }}>
                  <IconifyIcon icon="mdi:auto-fix" className="text-primary mt-1 flex-shrink-0" />
                  <div className="small">
                    <strong className="text-primary d-block mb-1">Résumé</strong>
                    <p className="mb-0 text-dark opacity-75">{c.call_analysis?.call_summary || "Aucun résumé."}</p>
                  </div>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 border-top gap-3">
                  <div className="small">
                    <span className="text-muted">Action:</span> <strong className="ms-1 text-dark">{c.suggestedAction}</strong>
                  </div>
                  <div className="d-flex gap-2">
                    {c.isNewPatient && (
                      <Button variant="outline-primary" className="rounded-2 px-3 btn-sm flex-fill" onClick={() => setShowPatientModal(true)}>
                        Créer Patient
                      </Button>
                    )}
                    <Button variant="outline-primary" className="rounded-2 px-4 fw-semibold d-flex align-items-center justify-content-center gap-2 btn-sm flex-fill"
                      onClick={() => {
                        if (c.call_id) openDetailModal(c.call_id);
                        else
                          showNotification?.({
                            message: 'Aucun call_id disponible pour ce record.',
                            variant: 'warning',
                          });
                      }}
                    >
                      <IconifyIcon icon="mdi:eye-outline" className="me-1" />
                      Détail
                    </Button>
                    <Button variant="primary" className="rounded-2 px-4 fw-semibold d-flex align-items-center justify-content-center gap-2 btn-sm flex-fill" style={{ backgroundColor: '#6f42c1', border: 'none' }}>
                      Traiter <IconifyIcon icon="mdi:arrow-right" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {!loading && filteredCalls.length === 0 && (
            <div className="text-center py-5">
              <IconifyIcon icon="mdi:clipboard-text-search-outline" className="fs-48 text-muted mb-2" />
              <h5 className="text-muted">Aucun appel trouvé</h5>
              <Button variant="link" className="small" onClick={() => { setTimeFilter('Tous'); setUrgencyFilter('Tous'); setCategoryFilter('Tous'); }}>Réinitialiser les filtres</Button>
            </div>
          )}
        </div>
      )}

      <PatientFormModal show={showPatientModal} mode="create" onClose={() => setShowPatientModal(false)} onSaved={fetchCalls} />
      <Modal show={showDetailModal} onHide={closeDetailModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails de l appel</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : callDetail ? (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Agent:</strong> {callDetail.agent_name ?? '-'}
                </Col>
                <Col md={6}>
                  <strong>Call ID:</strong> {callDetail.call_id ?? '-'}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>Phone (From):</strong> {callDetail.from_number ?? '-'}
                </Col>
                <Col md={4}>
                  <strong>To:</strong> {callDetail.to_number ?? '-'}
                </Col>
                <Col md={4}>
                  <strong>Duration:</strong> {msToHMS(callDetail.duration_ms)}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={4}>
                  <strong>Cost:</strong>{' '}
                  {callDetail.call_cost?.combined_cost != null
                    ? `${Number(callDetail.call_cost.combined_cost).toFixed(2)}`
                    : '-'}
                </Col>
                <Col md={4}>
                  <strong>Call Status:</strong> {callDetail.call_status ?? '-'}
                </Col>
                <Col md={4}>
                  <strong>Disconnection Reason:</strong> {callDetail.disconnection_reason ?? '-'}
                </Col>
              </Row>

              <hr />

              <h6>Conversation Analysis</h6>
              <Row>
                <Col md={6}>
                  <div>
                    <strong>Call Successful:</strong>{' '}
                    {callDetail.call_analysis?.call_successful != null
                      ? callDetail.call_analysis.call_successful.toString()
                      : '-'}
                  </div>
                  <div>
                    <strong>Call Status:</strong> {callDetail.call_status ?? '-'}
                  </div>
                  <div>
                    <strong>User Sentiment:</strong>{' '}
                    {callDetail.call_analysis?.user_sentiment ?? '-'}
                  </div>
                  <div>
                    <strong>Disconnection Reason:</strong> {callDetail.disconnection_reason ?? '-'}
                  </div>
                  <div>
                    <strong>End to End Latency:</strong>{' '}
                    {callDetail.latency?.e2e?.p50
                      ? `${Math.round(callDetail.latency.e2e.p50)} ms`
                      : '-'}
                  </div>
                </Col>

                <Col md={6}>
                  <div className="recording-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="mb-0">Recording</strong>
                      {callDetail.recording_duration_ms ? (
                        <small className="text-muted">{msToHMS(callDetail.recording_duration_ms)}</small>
                      ) : null}
                    </div>

                    {callDetail.recording_url ? (
                      <div className="recording-box shadow-sm rounded p-3 bg-white">
                        <div className="audio-wrap d-flex align-items-center gap-3">
                          <div className="audio-player flex-grow-1">
                            <audio controls className="recording-player" preload="metadata">
                              <source src={callDetail.recording_url} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                          {/* <div className="d-none d-sm-flex align-items-center audio-meta">
                            <div className="text-muted small me-2">{msToHMS(callDetail.recording_duration_ms)}</div>
                            <a
                              href={callDetail.recording_url}
                              download={`recording_${callDetail.call_id || 'audio'}.wav`}
                              className="btn btn-sm btn-outline-primary"
                              title="Download recording"
                            >
                              <IconifyIcon icon="mdi:download" className="me-1" /> Download
                            </a>
                          </div> */}
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="text-muted small">Source: {callDetail.recording_source ?? '—'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted">-</div>
                    )}
                  </div>
                </Col>
              </Row>

              <hr />

              <h6>Summary & Transcription</h6>
              <div style={{ whiteSpace: 'pre-wrap', maxHeight: '220px', overflow: 'auto' }}>
                <strong>Summary:</strong>
                <div>{callDetail.call_analysis?.call_summary ?? '—'}</div>
                <hr />
                <strong>Transcript / Conversation (agent vs user):</strong>
                <div style={{ marginTop: 8 }}>
                  {/* If transcript available as string */}
                  {callDetail.transcript ? (
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{callDetail.transcript}</pre>
                  ) : callDetail.transcript_object ? (
                    // render an aggregated transcript from transcript_object
                    <div>
                      {Array.isArray(callDetail.transcript_object) &&
                        callDetail.transcript_object.map((t: any, i: number) => (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <strong>{t.role ?? 'utterance'}:</strong> {t.content}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div>-</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div>Aucun détail disponible.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetailModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default CallerListPage;