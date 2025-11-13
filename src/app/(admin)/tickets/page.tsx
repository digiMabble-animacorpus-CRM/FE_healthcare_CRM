'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Modal,
  Form,
} from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';

const PAGE_LIMIT = 10;
const RETELL_LIST_ENDPOINT = 'https://api.retellai.com/v2/list-calls';
const RETELL_GET_ENDPOINT = 'https://api.retellai.com/v2/get-call';

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
  status?: string; // new field
};

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

const TicketPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketType | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<number | null>(null);

  // helper: normalize strings for comparison
  const normalize = (s?: string) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

  // helper: does call transcript contain a user message that matches the ticket name?
  const callMatchesTicket = (call: any, ticket: TicketType) => {
    if (!call || !call.transcript_object || !Array.isArray(call.transcript_object)) return false;

    const first = normalize(ticket.first_name);
    const last = normalize(ticket.last_name);
    if (!first && !last) return false;

    // possible patterns to match
    const patterns: string[] = [];
    if (first && last) {
      patterns.push(`${first} ${last}`); // "sarah mauvio"
      patterns.push(`${first}, ${last}`); // "sarah, mauvio"
      patterns.push(`${last} ${first}`); // "mauvio sarah" (less likely but safe)
      patterns.push(`${last}, ${first}`);
    }
    if (last) patterns.push(last); // fallback to last name only (be careful)
    if (first) patterns.push(first);

    // check each user role message for any pattern
    return call.transcript_object.some((msg: any) => {
      if (!msg || msg.role !== 'user') return false;
      if (!msg.content || typeof msg.content !== 'string') return false;

      const content = normalize(msg.content.replace(/[.]/g, '')); // remove trailing dots
      // check whole phrase match (avoid partial accidental matches)
      return patterns.some((p) => {
        if (!p) return false;
        return content.includes(p);
      });
    });
  };

  // check if a phone number is invalid or placeholder
  const isInvalidPhone = (phone: any) => {
    if (phone === null || phone === undefined) return true;

    const normalized = phone.toString().trim().toLowerCase();
    const invalidValues = [
      '',
      'caller_number',
      'appelant',
      'caller',
      'unknown',
      'na',
      'null',
      'undefined',
      'caller number'
    ];

    if (invalidValues.includes(normalized)) return true;

    const hasDigit = /\d/.test(normalized);
    return !hasDigit;
  };

  const fetchTickets = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/new-requests-appointment-management`, {
        params: {
          page,
          limit: PAGE_LIMIT,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const ticketData: TicketType[] = response.data.new_requests || response.data || [];

      let callList: any[] = [];
      try {
        const apiKey = getRetellApiKey();
        const body: any = {
          page,
          limit: PAGE_LIMIT,
        };
        if (searchTerm) body.search = searchTerm;
        if (apiKey) {
          const retellRes = await axios.post(RETELL_LIST_ENDPOINT, body, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });
          // retellRes.data may be an array or {calls: [...]}, adapt to your actual response
          callList = Array.isArray(retellRes.data)
            ? retellRes.data
            : retellRes.data.calls || retellRes.data || [];
        } else {
          // no key configured — skip retell matching
          console.warn('NEXT_PUBLIC_RETELL_KEY not configured; skipping RetellAI enrichment.');
        }
      } catch (err) {
        console.warn('Failed to fetch Retell calls — continuing without enrichment.', err);
        callList = [];
      }

      const enrichedTickets = ticketData.map((ticket) => {
        const updated = { ...ticket };

        if (!isInvalidPhone(updated.phone)) {
          return updated;
        }

        const match = callList.find((call: any) => callMatchesTicket(call, ticket));

        if (match?.from_number) {
          updated.phone = match.from_number;
        }

        return updated;
      });

      const finalTickets = enrichedTickets.map((t) => ({
        ...t,
        status: t.status || 'New',
      }));

      setTickets(finalTickets);

      const totalItems =
        typeof response.data.total === 'number'
          ? response.data.total
          : typeof response.data.count === 'number'
            ? response.data.count
            : finalTickets.length;
      setTotalPages(Math.max(1, Math.ceil(totalItems / PAGE_LIMIT)));
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/new-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const ticket = response.data;
      setEditTicket({
        ...ticket,
        status: ticket.status || 'New',
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTicket) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_BASE_PATH}/new-requests/${editTicket.id}`, editTicket, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // update list
      setTickets((prev) => prev.map((t) => (t.id === editTicket.id ? editTicket : t)));
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTicketId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTicketId) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_PATH}/new-requests/${deleteTicketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setTickets((prev) => prev.filter((t) => t.id !== deleteTicketId));
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    } finally {
      setShowDeleteModal(false);
      setDeleteTicketId(null);
    }
  };

  return (
    <>
      <PageTitle subName="Billets" title="Liste des Billets" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de tous les Billets ({tickets.length} Total)
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
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
                        <th>No</th>
                        <th>Nom</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Spécialité</th>
                        <th>Lieu</th>
                        <th>Enfant</th>
                        <th>Âge</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Créé le</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket: TicketType, idx: number) => (
                        <tr key={ticket.id}>
                          <td>{idx + 1}</td>
                          <td>
                            {ticket.first_name} {ticket.last_name}
                          </td>
                          <td>{ticket.email}</td>
                          <td>{ticket.phone}</td>
                          <td>{ticket.specialty}</td>
                          <td>{ticket.location}</td>
                          <td>{ticket.is_for_child ? ticket.child_name || '-' : '-'}</td>
                          <td>{ticket.is_for_child ? ticket.child_age : '-'}</td>
                          <td>{ticket.description}</td>
                          <td>{ticket.status}</td>
                          <td>{new Date(ticket.created_at).toLocaleString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(ticket.id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(ticket.id)}
                              >
                                <IconifyIcon
                                  icon="solar:trash-bin-minimalistic-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editTicket && (
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.first_name}
                      onChange={(e) => setEditTicket({ ...editTicket, first_name: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom de famille </Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.last_name}
                      onChange={(e) => setEditTicket({ ...editTicket, last_name: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={editTicket.email}
                      onChange={(e) => setEditTicket({ ...editTicket, email: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.phone}
                      onChange={(e) => setEditTicket({ ...editTicket, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Spécialité</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.specialty}
                      onChange={(e) => setEditTicket({ ...editTicket, specialty: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Lieu</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.location}
                      onChange={(e) => setEditTicket({ ...editTicket, location: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Enfant</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.child_name || ''}
                      onChange={(e) => setEditTicket({ ...editTicket, child_name: e.target.value })}
                      disabled={!editTicket.is_for_child}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Âge de l enfant</Form.Label>
                    <Form.Control
                      type="number"
                      value={editTicket.child_age || 0}
                      onChange={(e) =>
                        setEditTicket({
                          ...editTicket,
                          child_age: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!editTicket.is_for_child}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editTicket.description}
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, description: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.address}
                      onChange={(e) => setEditTicket({ ...editTicket, address: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={editTicket.status}
                      onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce ticket ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TicketPage;
