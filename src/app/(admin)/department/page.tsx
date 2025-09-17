'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
import type { DepartmentType } from '@/types/data';
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
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';

const PAGE_LIMIT = 10;

const DepartmentListPage = () => {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const router = useRouter();

  const fetchDepartments = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/departments`, {
        params: {
          page,
          limit: PAGE_LIMIT,
          search: searchTerm, // Pass search term to API
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setDepartments(
        (response.data || []).map((dept: any) => ({
          ...dept,
          _id: dept.id,
        })),
      );
      console.log('response.data:', response.data);
      setTotalPages(Math.ceil((response.data.length || 0) / PAGE_LIMIT));
    } catch (error) {
      // fallback mock data
      setDepartments([
        {
          _id: '1',
          name: 'Cardiology',
          is_active: true,
          description: 'Handles heart-related treatments',
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (id: string) => {
    router.push(`/department/department-form/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDepartmentId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartmentId) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_PATH}/departments/${selectedDepartmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchDepartments(currentPage);
    } catch (error) {
      console.error('Failed to delete department:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedDepartmentId(null);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${API_BASE_PATH}/departments/${id}`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // update UI immediately
      setDepartments((prev) =>
        prev.map((dept) => (dept._id === id ? { ...dept, is_active: newStatus } : dept)),
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      // rollback UI if API fails
      setDepartments((prev) =>
        prev.map((dept) => (dept._id === id ? { ...dept, is_active: !newStatus } : dept)),
      );
    }
  };

  return (
    <>
      <PageTitle subName="Départements" title="Liste des départements" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de tous les départements ({departments.length} Total)
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push('/department/department-form/create')}
                >
                  Add Département
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
                        <th style={{ width: 20 }}>No</th>
                        <th>Département Name</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((department: DepartmentType, idx: number) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{department.name}</td>
                          <td>{department.description}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={department.is_active}
                                onChange={(e) =>
                                  handleToggleStatus(department._id, e.target.checked)
                                }
                              />
                              <label className="form-check-label">
                                {department.is_active ? 'Active' : 'Inactive'}
                              </label>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(department._id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(department._id)}
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
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce département ?</Modal.Body>
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

export default DepartmentListPage;
