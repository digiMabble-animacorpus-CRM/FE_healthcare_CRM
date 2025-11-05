'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { API_BASE_PATH, ROSA_BASE_API_PATH, ROSA_TOKEN } from '@/context/constants';
import type { BranchType } from '@/types/data';
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

const PAGE_LIMIT = 5; // Changed to 5 as requested

const BranchListPage = () => {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const fetchBranches = async (page: number, limit: number) => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString();

    try {
      const token = ROSA_TOKEN;
      const response = await axios.get(`${ROSA_BASE_API_PATH}/sites?${queryParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log("API Response:", response.data);
      
      const data = response.data.elements || [];
      const responseTotalCount = response.data.totalCount || 0;
      const responseTotalPages = response.data.totalPages || 1;
      const responseCurrentPage = response.data.page || 1;

      console.log("Processed data:", {
        dataLength: data.length,
        totalCount: responseTotalCount,
        totalPages: responseTotalPages,
        currentPage: responseCurrentPage
      });

      setBranches(data);
      setTotalCount(responseTotalCount);
      setTotalPages(responseTotalPages);
      setCurrentPage(responseCurrentPage); // Sync with API response

    } catch (error) {
      console.error('Failed to fetch branches:', error);
      setBranches([]);
      setTotalPages(1);
      setTotalCount(0);
      showNotification({
        message: 'Échec du chargement des succursales',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(currentPage, PAGE_LIMIT);
  }, [currentPage]); // Removed searchTerm from dependency until search API is implemented

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleEditClick = (id: string) => {
    if (!id) return;
    router.push(`/branches/branch-form/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) return;
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

      setShowDeleteModal(false);
      setSelectedBranchId(null);

      showNotification({
        message: 'Succursale supprimée avec succès',
        variant: 'success',
      });

      // Refetch current page, but if it was the last item on the page, go to previous page
      if (branches.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchBranches(currentPage, PAGE_LIMIT);
      }
    } catch (error) {
      console.error('Failed to delete branch:', error);
      setShowDeleteModal(false);
      setSelectedBranchId(null);
      showNotification({
        message: 'Échec de la suppression de la succursale',
        variant: 'danger',
      });
    }
  };

  const getContactValue = (infos: any[], type: string): string => {
    return infos?.find((info: any) => info.type === type)?.value || '-';
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const pages: (number | string)[] = [];
      
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if near beginning
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Adjust if near end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add first ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add second ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
      
      return pages;
    };

    return (
      <ul className="pagination justify-content-end mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <Button
            variant="link"
            className="page-link"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
        </li>

        {getPageNumbers().map((pageNum, index) => (
          <li 
            key={index} 
            className={`page-item ${currentPage === pageNum ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}
          >
            {pageNum === '...' ? (
              <span className="page-link">...</span>
            ) : (
              <Button 
                variant="link" 
                className="page-link" 
                onClick={() => handlePageChange(pageNum as number)}
              >
                {pageNum}
              </Button>
            )}
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <Button
            variant="link"
            className="page-link"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </li>
      </ul>
    );
  };

  return (
    <>
      <PageTitle subName="Succursales" title="Liste des succursales" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de toutes les succursales ({totalCount} Total)
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
                        <th>Email</th>
                        {/* <th>Action</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {branches.length > 0 ? (
                        branches.map((branch: any, idx: number) => (
                          <tr key={branch.id || idx}>
                            <td>{(currentPage - 1) * PAGE_LIMIT + idx + 1}</td>
                            <td>{branch.name}</td>
                            <td>{getContactValue(branch.contactInfos, 'PHONE')}</td>
                            <td>{getContactValue(branch.contactInfos, 'EMAIL')}</td>
                            {/* <td>
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
                            </td> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            Aucune succursale trouvée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>

            <CardFooter>
              {renderPagination()}
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