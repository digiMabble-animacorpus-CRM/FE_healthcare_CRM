'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { API_BASE_PATH } from '@/context/constants';
import type { SpecializationType } from '@/types/data';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

const PAGE_LIMIT = 10;

const SpecializationListPage = () => {
  const [specializations, setSpecializations] = useState<SpecializationType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();

  const fetchSpecializations = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/specializations`, {
        params: { page, limit: PAGE_LIMIT, search: searchTerm },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const specializationList = response.data?.data || [];
      const totalCount = response.data?.total || specializationList.length;

      setSpecializations(
        specializationList.map((spec: any) => ({
          ...spec,
          specialization_id: spec.specialization_id,
          department_name: spec.department?.name || 'Unknown',
        })),
      );
      console.log('Fetched specializations:', specializationList);
      setTotalPages(Math.ceil(totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
      setSpecializations([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleEditClick = (id: string) => {
    router.push(`/specialization/specialization-form/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedSpecializationId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSpecializationId) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_PATH}/specializations/${selectedSpecializationId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setMessage({ type: 'success', text: 'Spécialisation supprimée avec succès !' });
      fetchSpecializations(currentPage);
    } catch (error) {
      console.error('Failed to delete specialization:', error);
      setMessage({ type: 'error', text: 'Échec de la suppression de la spécialisation.' });
    } finally {
      setShowDeleteModal(false);
      setSelectedSpecializationId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // ✅ toggle active status with success/error message
  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      const spec = specializations.find((s) => s.specialization_id === id);
      if (!spec) return;

      await axios.patch(
        `${API_BASE_PATH}/specializations/${id}`,
        {
          department_id: spec.department_id,
          specialization_type: spec.specialization_type,
          description: spec.description,
          is_active: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setSpecializations((prev) =>
        prev.map((s) => (s.specialization_id === id ? { ...s, is_active: newStatus } : s)),
      );

      setMessage({
        type: 'success',
        text: `Statut mis à jour avec succès en ${newStatus ? 'Actif' : 'Inactif'}.`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      setSpecializations((prev) =>
        prev.map((s) => (s.specialization_id === id ? { ...s, is_active: !newStatus } : s)),
      );
      setMessage({
        type: 'error',
        text: 'Échec de la mise à jour du statut de la spécialisation.',
      });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <>
      <PageTitle subName="Spécialisations" title="Liste des spécialisations" />
      {message && (
        <div
          style={{
            margin: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            color: message.type === 'success' ? '#0f5132' : '#842029',
            backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
            border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de toutes les spécialisations ({specializations.length} Total)
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par type..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push('/specialization/specialization-form/create')}
                >
                  Add Spécialisation
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
                        <th style={{ width: 20 }}>Nom</th>
                        <th>Spécialisation</th>
                        <th>Description</th>
                        <th>Département</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specializations.map((spec: SpecializationType, idx: number) => (
                        <tr key={spec.specialization_id}>
                          <td>{idx + 1}</td>
                          <td>{spec.specialization_type}</td>
                          <td>{spec.description}</td>
                          <td>{spec.department_name}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={spec.is_active}
                                onChange={(e) =>
                                  handleToggleStatus(spec.specialization_id, e.target.checked)
                                }
                              />
                              <label className="form-check-label">
                                {spec.is_active ? 'Active' : 'Inactive'}
                              </label>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(spec.specialization_id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(spec.specialization_id)}
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer cette spécialisation ?</Modal.Body>
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

export default SpecializationListPage;
