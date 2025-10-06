'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
import type { StaffRoleType } from '@/types/data';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { getAllStaffRoll } from '@/helpers/staff';

const PAGE_LIMIT = 10;

const StaffRoleListPage = () => {
  const [staffRoles, setStaffRoles] = useState<StaffRoleType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Role' | 'AccessLevel' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const router = useRouter();

  const fetchStaffRoles = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAllStaffRoll(
        page,
        PAGE_LIMIT,
        selectedTag || undefined,
        searchTerm,
      );
      setStaffRoles(response.data);
      setTotalPages(Math.ceil(response.totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error('Failed to fetch staff roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffRoles(currentPage);
  }, [currentPage, selectedTag, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleView = (id: any) => {
    router.push(`/staff-role/details/${id}`);
  };

  const handleEditClick = (id: any) => {
    router.push(`/staff-role/staffRole-form/${id}/edit`);
  };

  const handleDeleteClick = (id: any) => {
    setSelectedRoleId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRoleId) return;

    try {
      await fetch(`/api/staff-roles/${selectedRoleId}`, {
        method: 'DELETE',
      });

      fetchStaffRoles(currentPage);
    } catch (error) {
      console.error('Failed to delete staff role:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedRoleId(null);
    }
  };

  return (
    <>
      <PageTitle subName="Rôles du personnel" title="Liste des rôles du personnel" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de tous les rôles du personnel
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par clé ou par étiquette..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Dropdown>
                  <DropdownToggle className="btn btn-sm btn-outline-white" id="tagFilter">
                    <IconifyIcon
                      icon="material-symbols:location-on-outline"
                      width={18}
                      className="me-1"
                    />
                    {selectedTag || 'Filtrer par balise'}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => {
                        setSelectedTag('Role');
                        setCurrentPage(1);
                      }}
                      active={selectedTag === 'Role'}
                    >
                      Rôle
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        setSelectedTag('AccessLevel');
                        setCurrentPage(1);
                      }}
                      active={selectedTag === 'AccessLevel'}
                    >
                      Niveau d accès
                    </DropdownItem>
                    {selectedTag && (
                      <DropdownItem
                        className="text-danger"
                        onClick={() => {
                          setSelectedTag(null);
                          setCurrentPage(1);
                        }}
                      >
                        Effacer le filtre de balises
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
                <Button
                  variant="primary"
                  onClick={() => router.push('/staff-role/staffRole-form/create')}
                >
                  Ajouter un rôle de personnel
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
                        <th>NON</th>
                        <th>Clé</th>
                        <th>Étiquette</th>
                        <th>Étiqueter</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffRoles.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.key}</td>
                          <td>{item.label}</td>
                          <td>{item.tag}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleView(item._id)}
                              >
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(item._id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(item._id)}
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
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce rôle de personnel ?</Modal.Body>
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

export default StaffRoleListPage;
