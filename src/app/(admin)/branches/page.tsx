'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { API_BASE_PATH } from '@/context/constants';
import type { BranchType } from '@/types/data';
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

const BranchListPage = () => {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const router = useRouter();

  const fetchBranches = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/branches`, {
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

      const data = response.data?.data || response.data || [];
      const totalCount = response.data?.totalCount || data.length || 0;

      // ✅ Normalize branch data → always keep an `id`
      setBranches(
        data.map((branch: any) => ({
          id:
            branch.branch_id?.toString() ??
            branch._id ??
            branch.id ??
            '', // branch_id is the correct field from backend
          name: branch.name ?? '-',
          code: branch.code ?? '-',
          phone: branch.phone ?? '-',
        })),
      );

      console.log('Fetched branches:', data);
      setTotalPages(Math.ceil(totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      setBranches([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (id: string) => {
    if (!id) return;
    console.log('Edit branch with ID:', id);
    router.push(`/branches/branch-form/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) return;
    console.log('Delete branch with ID:', id);
    setSelectedBranchId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBranchId) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_PATH}/branches/${selectedBranchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchBranches(currentPage);
    } catch (error) {
      console.error('Failed to delete branch:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedBranchId(null);
    }
  };

  return (
    <>
      <PageTitle subName="Succursales" title="Liste des succursales" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de toutes les succursales ({branches.length} Total)
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
                  onClick={() => router.push('/branches/branch-form/create')}
                >
                  Ajouter une succursale
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
                        <th>No</th>
                        <th>Nom de la succursale</th>
                        <th>Téléphone</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch: any, idx: number) => (
                        <tr key={branch.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{branch.name}</td>
                          <td>{branch.phone}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(branch.id)}
                                disabled={!branch.id}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(branch.id)}
                                disabled={!branch.id}
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
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cette succursale ? Cette action est irréversible.
        </Modal.Body>
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

export default BranchListPage;
