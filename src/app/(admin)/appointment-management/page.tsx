'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
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
  Spinner
} from 'react-bootstrap';

const PAGE_LIMIT = 10;

type AppointmentManagementType = {
  id: number;
  action: string;
  therapist_name: string;
  appointment_date: string;
  appointment_time: string;
  preferred_new_date: string;
  preferred_new_time: string;
  location: string;
  created_at: string;
  first_name: string;
};

const AppointmentManagementPage = () => {
  const [appointmentManagement, setAppointmentManagement] = useState<AppointmentManagementType[]>(
    [],
  );
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTicket, setEditTicket] = useState<AppointmentManagementType | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<number | null>(null);

  const fetchAppointmentManagement = async (page: number) => {
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

      const data: AppointmentManagementType[] = response.data.appointment_management || [];
      // add default status = "New"
      const enriched = data.map((t) => ({
        ...t,
      }));

      setAppointmentManagement(enriched);
      setTotalPages(Math.ceil((data.length || 0) / PAGE_LIMIT));
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setAppointmentManagement([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentManagement(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // const handleEditClick = async (id: number) => {
  //   try {
  //     const token = localStorage.getItem('access_token');
  //     const response = await axios.get(`${API_BASE_PATH}/new-requests/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const ticket = response.data;
  //     setEditTicket({
  //       ...ticket,
  //       status: ticket.status || 'New',
  //     });
  //     setShowEditModal(true);
  //   } catch (error) {
  //     console.error('Failed to fetch ticket details:', error);
  //   }
  // };

  // const handleSaveEdit = async () => {
  //   if (!editTicket) return;

  //   try {
  //     const token = localStorage.getItem('access_token');
  //     await axios.patch(
  //       `${API_BASE_PATH}/new-requests/${editTicket.id}`,
  //       editTicket,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     // update list
  //     setAppointmentManagement((prev) =>
  //       prev.map((t) => (t.id === editTicket.id ? editTicket : t)),
  //     );
  //     setShowEditModal(false);
  //   } catch (error) {
  //     console.error('Failed to update ticket:', error);
  //   }
  // };

  // const handleDeleteClick = (id: number) => {
  //   setDeleteTicketId(id);
  //   setShowDeleteModal(true);
  // };

  // const handleConfirmDelete = async () => {
  //   if (!deleteTicketId) return;
  //   try {
  //     const token = localStorage.getItem('access_token');
  //     await axios.delete(`${API_BASE_PATH}/new-requests/${deleteTicketId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     setAppointmentManagement((prev) => prev.filter((t) => t.id !== deleteTicketId));
  //   } catch (error) {
  //     console.error('Failed to delete ticket:', error);
  //   } finally {
  //     setShowDeleteModal(false);
  //     setDeleteTicketId(null);
  //   }
  // };

  return (
    <>
      <PageTitle subName="Gestion des rendez-vous" title="Liste des Gestion des rendez-vous" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de tous les Gestion des rendez-vous ({appointmentManagement.length} Total)
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
                        <th>Non</th>
                        <th>Nom</th>
                        <th>Emplacement</th>
                        <th>Nom du thérapeute</th>
                        <th>Date de rendez-vous</th>
                        <th>Heure de rendez-vous</th>
                        <th>Nouvelle date préférée</th>
                        <th>Nouvelle heure préférée</th>
                        <th>Statut</th>
                        <th>Créé à</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentManagement.map(
                        (ticket: AppointmentManagementType, idx: number) => (
                          <tr key={ticket.id}>
                            <td>{idx + 1}</td>
                            <td>{ticket.first_name}</td>
                            <td>{ticket.location}</td>
                            <td>{ticket.therapist_name}</td>
                            <td>{ticket.appointment_date}</td>
                            <td>{ticket.appointment_time}</td>
                            <td>{ticket.preferred_new_date}</td>
                            <td>{ticket.preferred_new_time}</td>
                            <td>{ticket.action}</td>
                            <td>{new Date(ticket.created_at).toLocaleString()}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="soft-primary"
                                  size="sm"
                                  // onClick={() => handleEditClick(ticket.id)}
                                >
                                  <IconifyIcon
                                    icon="solar:pen-2-broken"
                                    className="align-middle fs-18"
                                  />
                                </Button>
                                <Button
                                  variant="soft-danger"
                                  size="sm"
                                  // onClick={() => handleDeleteClick(ticket.id)}
                                >
                                  <IconifyIcon
                                    icon="solar:trash-bin-minimalistic-2-broken"
                                    className="align-middle fs-18"
                                  />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ),
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

      {/* Edit Modal */}
      {/* <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
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
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, first_name: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.last_name}
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, last_name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, email: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.phone}
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, phone: e.target.value })
                      }
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
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, specialty: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Lieu</Form.Label>
                    <Form.Control
                      type="text"
                      value={editTicket.location}
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, location: e.target.value })
                      }
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
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, child_name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, address: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={editTicket.status}
                      onChange={(e) =>
                        setEditTicket({ ...editTicket, status: e.target.value })
                      }
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
      </Modal> */}

      {/* Delete Modal */}
      {/* <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
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
      </Modal> */}
    </>
  );
};

export default AppointmentManagementPage;
