'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Spinner,
  Modal,
  Form,
  Badge,
  Container,
} from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';

const PAGE_LIMIT = 10;
const RETELL_LIST_ENDPOINT = 'https://api.retellai.com/v2/list-calls';

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
  urgency?: 'Urgent' | 'Moyen' | 'Normal';
};

type StatsType = {
  adult: number;
  child: number;
  couple: number;
  internship: number;
  job: number;
  partnership: number;
  supplier: number;
  information: number;
};

const TicketPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [stats, setStats] = useState<StatsType>({
    adult: 0,
    child: 0,
    couple: 0,
    internship: 0,
    job: 0,
    partnership: 0,
    supplier: 0,
    information: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tous');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<number | null>(null);

  const getRetellApiKey = () => {
    if (typeof window !== 'undefined') {
      const fromStorage = localStorage.getItem('retell_api_key');
      if (fromStorage) return fromStorage;
    }
    return 'key_1d964c4ebd944cdf5f7c9af67b12';
  };

  const normalize = (s?: string) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

  const callMatchesTicket = (call: any, ticket: TicketType) => {
    if (!call || !call.transcript_object || !Array.isArray(call.transcript_object)) return false;
    const first = normalize(ticket.first_name);
    const last = normalize(ticket.last_name);
    if (!first && !last) return false;
    const patterns = [`${first} ${last}`, `${first}, ${last}`, last, first];
    return call.transcript_object.some((msg: any) => {
      if (!msg || msg.role !== 'user' || !msg.content) return false;
      const content = normalize(msg.content.replace(/[.]/g, ''));
      return patterns.some((p) => p && content.includes(p));
    });
  };

  const isInvalidPhone = (phone: any) => {
    if (!phone) return true;
    const normalized = phone.toString().trim().toLowerCase();
    const invalid = ['', 'caller_number', 'appelant', 'caller', 'unknown', 'na', 'null', 'undefined'];
    return invalid.includes(normalized) || !/\d/.test(normalized);
  };

  const calculateStats = (ticketList: TicketType[]) => {
    const newStats: StatsType = {
      adult: 0,
      child: 0,
      couple: 0,
      internship: 0,
      job: 0,
      partnership: 0,
      supplier: 0,
      information: 0,
    };

    ticketList.forEach((ticket) => {
      if (ticket.is_for_child) {
        newStats.child++;
      } else {
        newStats.adult++;
      }

      const spec = ticket.specialty?.toLowerCase() || '';
      const desc = ticket.description?.toLowerCase() || '';

      if (spec.includes('couple') || desc.includes('couple')) newStats.couple++;
      if (spec.includes('internship') || spec.includes('stage')) newStats.internship++;
      if (spec.includes('job') || spec.includes('emploi')) newStats.job++;
      if (spec.includes('partnership') || spec.includes('partenariat')) newStats.partnership++;
      if (spec.includes('supplier') || spec.includes('fournisseur')) newStats.supplier++;
      if (spec.includes('information') || spec.includes('info')) newStats.information++;
    });

    setStats(newStats);
  };

  const fetchTickets = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/new-requests-appointment-management`, {
        params: { page, limit: PAGE_LIMIT, search: searchTerm },
        headers: { Authorization: `Bearer ${token}` },
      });
      const ticketData: TicketType[] = response.data.new_requests || response.data || [];
      let callList: any[] = [];

      try {
        const apiKey = getRetellApiKey();
        if (apiKey) {
          const retellRes = await axios.post(RETELL_LIST_ENDPOINT, { page, limit: PAGE_LIMIT, search: searchTerm }, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          callList = Array.isArray(retellRes.data) ? retellRes.data : retellRes.data.calls || [];
        }
      } catch (err) { console.warn('Retell skip', err); }

      const finalTickets = ticketData.map((t) => {
        const updated = { ...t, status: t.status || 'Nouveau', urgency: 'Urgent' as const };
        if (isInvalidPhone(updated.phone)) {
          const match = callList.find((call: any) => callMatchesTicket(call, t));
          if (match?.from_number) updated.phone = match.from_number;
        }
        return updated;
      });

      setTickets(finalTickets);
      calculateStats(finalTickets);
      setTotalPages(Math.max(1, Math.ceil((response.data.total || finalTickets.length) / PAGE_LIMIT)));
    } catch (error) {
      console.error(error);
      setTickets([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(currentPage); }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const handleEditClick = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/new-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditTicket({ ...response.data, status: response.data.status || 'Nouveau' });
      setShowEditModal(true);
    } catch (error) { console.error(error); }
  };

  const handleSaveEdit = async () => {
    if (!editTicket) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_BASE_PATH}/new-requests/${editTicket.id}`, editTicket, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets((prev) => prev.map((t) => (t.id === editTicket.id ? editTicket : t)));
      calculateStats(tickets.map((t) => (t.id === editTicket.id ? editTicket : t)));
      setShowEditModal(false);
    } catch (error) { console.error(error); }
  };

  const handleDeleteClick = (id: number) => { setDeleteTicketId(id); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTicketId) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_PATH}/new-requests/${deleteTicketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newTickets = tickets.filter((t) => t.id !== deleteTicketId);
      setTickets(newTickets);
      calculateStats(newTickets);
    } finally { setShowDeleteModal(false); }
  };

  const getTimeAgo = (dateString: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  };

  const indicators = [
    { label: 'Adulte', count: stats.adult, icon: 'solar:user-broken', color: 'primary' },
    { label: 'Enfant', count: stats.child, icon: 'solar:shield-user-broken', color: 'info' },
    { label: 'Couple', count: stats.couple, icon: 'solar:heart-broken', color: 'danger' },
    { label: 'Stage', count: stats.internship, icon: 'solar:medal-ribbon-broken', color: 'secondary' },
    { label: 'Candidature', count: stats.job, icon: 'solar:case-minimalistic-broken', color: 'primary' },
    { label: 'Partenariat', count: stats.partnership, icon: 'solar:users-group-rounded-broken', color: 'success' },
    { label: 'Fournisseur', count: stats.supplier, icon: 'solar:delivery-broken', color: 'warning' },
    { label: 'Information', count: stats.information, icon: 'solar:info-circle-broken', color: 'dark' },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    if (activeFilter === 'Patients') return ticket.is_for_child || !ticket.specialty?.toLowerCase().includes('job');
    if (activeFilter === 'Professionnel') return ticket.specialty?.toLowerCase().includes('job') || ticket.specialty?.toLowerCase().includes('partnership');
    return true;
  });

  const filterCounts = {
    Tous: tickets.length,
    Patients: tickets.filter(t => t.is_for_child || !t.specialty?.toLowerCase().includes('job')).length,
    Professionnel: tickets.filter(t => t.specialty?.toLowerCase().includes('job') || t.specialty?.toLowerCase().includes('partnership')).length,
  };

  return (
    <Container fluid className="p-4 " style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex align-items-center mb-4"> 
        <div>
          <h2 className="fw-bold mb-0" style={{ fontSize: '24px' }}>Demandes & Requêtes</h2>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Demandes entrantes classées par type</p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3 flex-nowrap overflow-auto pb-2 custom-scrollbar">
        {indicators.map((ind, i) => (
          <Col
            key={i}
            className="flex-fill"
            style={{ minWidth: '120px' }}
          >
            <Card
              className="border-0 shadow-sm h-100 stat-card"
              style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
            >
              <CardBody className="p-3 text-center d-flex flex-column align-items-center justify-content-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: `rgba(var(--bs-${ind.color}-rgb), 0.1)`,
                    flexShrink: 0
                  }}
                >
                  <IconifyIcon icon={ind.icon} className={`text-${ind.color} fs-4`} />
                </div>

                <h4 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                  {ind.count}
                </h4>

                <small
                  className="text-muted text-uppercase fw-semibold mt-1"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.5px',
                    display: 'block',
                    lineHeight: '1.2'
                  }}
                >
                  {ind.label}
                </small>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Tabs */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <CardBody className="p-3">
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex flex-wrap gap-2">
                {['Tous', 'Patients', 'Professionnel'].map((f) => (
                  <Button
                    key={f}
                    variant={activeFilter === f ? 'primary' : 'light'}
                    className="rounded-pill border-0 fw-semibold"
                    style={{ padding: '8px 20px', fontSize: '14px' }}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                    <Badge
                      bg={activeFilter === f ? 'white' : 'secondary'}
                      text={activeFilter === f ? 'primary' : 'white'}
                      className="ms-2"
                      style={{ fontSize: '12px' }}
                    >
                      {filterCounts[f as keyof typeof filterCounts]}
                    </Badge>
                  </Button>
                ))}
              </div>
            </Col>
            <Col md={6} className="mt-3 mt-md-0">
              <div className="position-relative">
                <IconifyIcon icon="solar:magnifer-broken"
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="text"
                  placeholder="Rechercher par nom, email ou spécialité..."
                  className="rounded-pill border-light bg-light ps-5 py-2 shadow-none"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Tickets List */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <span className="text-muted fw-medium">Chargement des demandes...</span>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="border-0 shadow-sm ticket-card" style={{ borderRadius: '16px' }}>
              <CardBody className="p-4">
                <Row>
                  <Col xs="auto">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${ticket.is_for_child ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'}`}
                      style={{ width: '56px', height: '56px' }}>
                      <IconifyIcon
                        icon={ticket.is_for_child ? "solar:baby-carriage-bold-duotone" : "solar:user-bold-duotone"}
                        className="fs-3"
                      />
                    </div>
                  </Col>

                  <Col>
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="mb-0 fw-bold">{ticket.first_name} {ticket.last_name}</h5>
                        <Badge bg={ticket.is_for_child ? 'info' : 'secondary'} className="rounded-pill" style={{ fontSize: '12px', fontWeight: '500' }}>
                          {ticket.is_for_child ? 'Enfant' : 'Adulte'}
                        </Badge>
                        <Badge bg="danger" className="rounded-pill" style={{ fontSize: '12px', fontWeight: '500' }}>
                          {ticket.urgency}
                        </Badge>
                      </div>
                      <small className="text-muted">{getTimeAgo(ticket.created_at)}</small>
                    </div>

                    <p className="text-secondary mb-3" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {ticket.description}
                    </p>

                    <div className="d-flex flex-wrap gap-3 mb-3" style={{ fontSize: '13px' }}>
                      <div className="d-flex align-items-center text-muted">
                        <IconifyIcon icon="solar:phone-broken" className="me-2" />
                        {ticket.phone}
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <IconifyIcon icon="solar:letter-broken" className="me-2" />
                        {ticket.email}
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <IconifyIcon icon="solar:map-point-broken" className="me-2" />
                        {ticket.location}
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-muted" style={{ fontSize: '13px' }}>Spécialité demandée : </span>
                      <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{ticket.specialty}</span>
                    </div>

                    {ticket.is_for_child && (
                      <div className="bg-light rounded-3 p-2 px-3 mb-3 d-inline-flex align-items-center gap-2">
                        <small className="text-primary fw-semibold">
                          Nom de l'enfant : <span className="text-dark">{ticket.child_name} ({ticket.child_age} ans)</span>
                        </small>
                      </div>
                    )}

                    <div className="rounded-3 p-3 mb-3 border-0"
                      style={{ backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                      <div className="d-flex align-items-start gap-2">
                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '24px', height: '24px' }}>
                          <IconifyIcon icon="solar:magic-stick-3-bold-duotone" className="text-white" style={{ fontSize: '12px' }} />
                        </div>
                        <small className="text-dark">
                          Animus suggère de créer un dossier patient et de proposer un premier rendez-vous.
                        </small>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="rounded-pill px-3 fw-medium border-2"
                        onClick={() => handleEditClick(ticket.id)}
                      >
                        <IconifyIcon icon="solar:user-plus-broken" className="me-1" />
                        Créer dossier patient
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-pill px-4 border-0 shadow-sm"
                      >
                        Traiter <IconifyIcon icon="solar:alt-arrow-right-broken" className="ms-1" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <div className="bg-white p-2 rounded-pill shadow-sm d-flex align-items-center gap-1">
          <Button
            variant="light"
            className="rounded-circle p-2 shadow-none border-0"
            style={{ width: '40px', height: '40px' }}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <IconifyIcon icon="solar:alt-arrow-left-broken" />
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? 'primary' : 'light'}
              className="rounded-circle border-0 shadow-none"
              style={{ width: '40px', height: '40px' }}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="light"
            className="rounded-circle p-2 shadow-none border-0"
            style={{ width: '40px', height: '40px' }}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <IconifyIcon icon="solar:alt-arrow-right-broken" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" contentClassName="border-0 rounded-4 shadow">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold">Mettre à jour les infos</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editTicket && (
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Prénom</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" type="text" value={editTicket.first_name}
                      onChange={(e) => setEditTicket({ ...editTicket, first_name: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Nom</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" type="text" value={editTicket.last_name}
                      onChange={(e) => setEditTicket({ ...editTicket, last_name: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Email</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" type="email" value={editTicket.email}
                      onChange={(e) => setEditTicket({ ...editTicket, email: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Téléphone</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" type="text" value={editTicket.phone}
                      onChange={(e) => setEditTicket({ ...editTicket, phone: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Spécialité</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" type="text" value={editTicket.specialty}
                      onChange={(e) => setEditTicket({ ...editTicket, specialty: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Emplacement</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" type="text" value={editTicket.location}
                      onChange={(e) => setEditTicket({ ...editTicket, location: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                    <Form.Control className="bg-light border-0 py-2" as="textarea" rows={3} value={editTicket.description}
                      onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })} />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 p-4">
          <Button variant="light" className="rounded-3 px-4" onClick={() => setShowEditModal(false)}>Annuler</Button>
          <Button variant="primary" className="rounded-3 px-4" onClick={handleSaveEdit}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 rounded-4 shadow">
        <Modal.Body className="p-5 text-center">
          <div className="rounded-circle p-3 d-inline-block mb-3" style={{ backgroundColor: '#fee2e2' }}>
            <IconifyIcon icon="solar:trash-bin-minimalistic-2-bold" className="fs-1 text-danger" />
          </div>
          <h4 className="fw-bold">Supprimer la demande ?</h4>
          <p className="text-muted">Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette requête ?</p>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button variant="light" className="px-4 rounded-3" onClick={() => setShowDeleteModal(false)}>Non, garder</Button>
            <Button variant="danger" className="px-4 rounded-3" onClick={handleConfirmDelete}>Oui, supprimer</Button>
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    height: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  @media (min-width: 1200px) {
    .custom-scrollbar {
      overflow: hidden !important;
    }
  }
`}</style>
    </Container>
  );
};

export default TicketPage;