'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNotificationContext } from '@/context/useNotificationContext';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';

type CallType = {
  call_id: string;
  call_type?: string;
  agent_id?: string;
  agent_name?: string;
  call_status?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  from_number?: string;
  to_number?: string;
  direction?: string;
  disconnection_reason?: string;
  call_cost?: {
    combined_cost?: number;
    total_duration_seconds?: number;
  };
  call_analysis?: {
    user_sentiment?: string;
    call_summary?: string;
    call_successful?: boolean;
  };
  latency?: {
    e2e?: {
      p50?: number;
    };
  };
  // keep other fields flexible
  [k: string]: any;
};

const PAGE_LIMIT = 1000;
const RETELL_LIST_ENDPOINT = 'https://api.retellai.com/v2/list-calls';
const RETELL_GET_ENDPOINT = 'https://api.retellai.com/v2/get-call'; // append /{call_id}

// Provide a fallback API key: prefer localStorage 'retell_api_key' -> env var -> sample key (you provided)
const getRetellApiKey = () => {
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem('retell_api_key');
    if (fromStorage) return fromStorage;
  }
  // If you prefer to use env var, set NEXT_PUBLIC_RETELL_API_KEY in your environment
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RETELL_API_KEY) {
    return process.env.NEXT_PUBLIC_RETELL_API_KEY;
  }
  // fallback to the key you provided (replace/remove if sensitive)
  return 'key_1d964c4ebd944cdf5f7c9af67b12';
};

const formatDate = (ms?: number) => {
  if (!ms) return '-';
  try {
    const d = new Date(ms);
    return d.toLocaleString();
  } catch {
    return '-';
  }
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
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // modal & detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [callDetail, setCallDetail] = useState<CallType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { showNotification } = useNotificationContext();
  const router = useRouter();

  const fetchCalls = async (page: number) => {
    setLoading(true);
    try {
      const apiKey = getRetellApiKey();

      const body: any = {
        page,
        limit: PAGE_LIMIT,
      };
      if (searchTerm) body.search = searchTerm;

      const response = await axios.post(RETELL_LIST_ENDPOINT, body, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      let items: any[] = [];
      let pages = 1;

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data.calls)) {
        items = data.calls;
        pages = data.total_pages || Math.ceil((data.total || items.length) / PAGE_LIMIT);
      } else if (Array.isArray(data.data)) {
        items = data.data;
        pages = data.total_pages || Math.ceil((data.total || items.length) / PAGE_LIMIT);
      } else if (Array.isArray(data.results)) {
        items = data.results;
        pages = data.total_pages || Math.ceil((data.total || items.length) / PAGE_LIMIT);
      } else {
        items = data ? (Array.isArray(data) ? data : [data]) : [];
      }

      setCalls(
        items.map((c: any) => ({
          ...c,
          call_id: c.call_id ?? c.id ?? c.callId ?? c.call_id,
          agent_name: c.agent_name ?? c.agent,
          call_type: c.call_type ?? c.type,
          start_timestamp: c.start_timestamp ?? c.start_time,
          end_timestamp: c.end_timestamp ?? c.end_time,
          duration_ms: c.duration_ms ?? c.duration,
          from_number: c.from_number ?? c.from,
          to_number: c.to_number ?? c.to,
          direction: c.direction,
        })),
      );

      setTotalPages(pages || 1);
    } catch (err) {
      console.error('Failed to fetch calls', err);

      const sample: CallType[] = [
        {
          call_id: 'call_32a0efc1e8c9f8041e98b50f7d0',
          call_type: 'phone_call',
          agent_id: 'agent_b9c13c44c008dff0b27f752a11',
          agent_name: 'Single-Prompt Agent (copy)',
          call_status: 'ended',
          start_timestamp: 1762615270424,
          end_timestamp: 1762615403803,
          duration_ms: 133379,
          from_number: '+32466088641',
          to_number: '+3280089559',
          direction: 'inbound',
          disconnection_reason: 'agent_hangup',
          call_cost: { combined_cost: 28.9833333, total_duration_seconds: 134 },
          call_analysis: {
            user_sentiment: 'Positive',
            call_summary:
              'The user called to inquire about the appointment time for their son Louis David...',
            call_successful: true,
          },
          latency: { e2e: { p50: 2341.5 } },
        },
      ];
      setCalls(sample);
      setTotalPages(1);
      showNotification?.({
        message: 'Impossible de récupérer les appels — affichage des données d’exemple.',
        variant: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  return (
    <>
      <PageTitle subName="Appels" title="Liste des appels" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste des appels ({calls.length} Total)
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par From / To / Call ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button variant="primary" onClick={() => fetchCalls(1)}>
                  Rafraîchir
                </Button>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 20 }}>S.No</th>
                        <th>Nom de l’agent</th>
                        <th>Numéro du client</th>
                        <th>Numéro Anima Corpus</th>
                        <th>Durée de l’appel</th>
                        <th>Date et heure de l’appel</th>
                        
                        <th>Type de canal</th>
                        <th>Coût de l’appel</th>
                        {/* <th>End Reason</th> */}
                        {/* <th>Session Status</th> */}
                        {/* <th>User Sentiment</th> */}
                        
                        {/* <th>Direction</th>
                        <th>Session Outcome</th>
                        <th>End to End Latency (ms)</th> */}
                        
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((c: CallType, idx: number) => (
                        <tr key={c.call_id || idx}>
                          <td>{idx + 1}</td>
                          <td>{c.agent_name ?? '-'}</td>
                          <td>{c.from_number ?? '-'}</td>
                          <td>{c.to_number ?? '-'}</td>
                          <td>{msToHMS(c.duration_ms)}</td>
                          <td>{formatDate(c.start_timestamp)}</td>
                          
                          <td>{c.call_type ?? '-'}</td>
                          <td>
                            {c.call_cost?.combined_cost != null
                              ? `${Number(c.call_cost.combined_cost).toFixed(2)}`
                              : '-'}
                          </td>
                          {/* <td>{c.disconnection_reason ?? '-'}</td>
                          <td>{c.call_status ?? '-'}</td>
                          <td>{c.call_analysis?.user_sentiment ?? '-'}</td> */}
                          
                          {/* <td>{c.direction ?? '-'}</td>
                          <td>
                            {c.call_analysis?.call_successful != null
                              ? c.call_analysis.call_successful
                                ? 'Successful'
                                : 'Failed'
                              : '-'}
                          </td>
                          <td>
                            {(c.latency?.e2e?.p50 ?? c.latency?.e2e?.p50) !== undefined
                              ? Math.round(c.latency?.e2e?.p50 as number)
                              : '-'}
                          </td> */}
                          
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => {
                                  if (c.call_id) openDetailModal(c.call_id);
                                  else
                                    showNotification?.({
                                      message: 'Aucun call_id disponible pour ce record.',
                                      variant: 'warning',
                                    });
                                }}
                              >
                                <IconifyIcon icon="mdi:eye" className="align-middle fs-18" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {calls.length === 0 && !loading && (
                        <tr>
                          <td colSpan={15} className="text-center py-4">
                            Aucun appel trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>

            <CardFooter>
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Précédent
                    </Button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      key={index}
                    >
                      <Button
                        variant="link"
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Suivant
                    </Button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
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
                          <div className="d-none d-sm-flex align-items-center audio-meta">
                            <div className="text-muted small me-2">{msToHMS(callDetail.recording_duration_ms)}</div>
                            <a
                              href={callDetail.recording_url}
                              download={`recording_${callDetail.call_id || 'audio'}.wav`}
                              className="btn btn-sm btn-outline-primary"
                              title="Download recording"
                            >
                              <IconifyIcon icon="mdi:download" className="me-1" /> Download
                            </a>
                          </div>
                        </div>

                        {/* <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="text-muted small">Source: {callDetail.recording_source ?? '—'}</div>
                        </div> */}
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

      <style jsx>{`
        .audio-wrap {
          gap: 12px;
        }
        .recording-player {
          width: 100%;
          height: 46px;
          background: #f7f9fb;
          border-radius: 10px;
          padding: 4px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
        }
        /* small responsive tweaks */
        .audio-meta .text-muted {
          min-width: 48px;
          text-align: right;
        }
        @media (max-width: 575px) {
          .audio-meta { display: none !important; }
          .recording-player { height: 40px; }
        }
      `}</style>
    </>
  );
};

export default CallerListPage;
