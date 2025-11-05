'use client';

import '@/assets/scss/components/_edittogglebtn.scss';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useNotificationContext } from '@/context/useNotificationContext';
import { deletePatient, getAllPatient } from '@/helpers/patient';
import type { BirthDate, PatientType } from '@/types/data';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  Spinner
} from 'react-bootstrap';

const PAGE_SIZE = 10;

const PatientsListPage = () => {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { showNotification } = useNotificationContext();
  const router = useRouter();

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getAllPatient(currentPage, PAGE_SIZE);
      setPatients(response.data || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPage || 0);
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const getContactValue = (infos: any[], type: string): string => {
    return infos?.find((info: any) => info.type === type)?.value || '-';
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;

    const term = searchTerm.trim().toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.toLowerCase();
      const email = getContactValue(patient.contactInfos ?? [], 'EMAIL').toLowerCase();
      const phone = getContactValue(patient.contactInfos ?? [], 'PHONE').toLowerCase();

      return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [patients, searchTerm]);

  const currentData = useMemo(() => filteredPatients, [filteredPatients]);

  const calculateAge = (birthdate: string | BirthDate | null | undefined): string => {
    if (!birthdate) return '-';

    const today = new Date();
    let birth: Date;

    if (typeof birthdate === 'string') {
      birth = new Date(birthdate);
    } else {
      birth = new Date(birthdate.year, birthdate.month - 1, birthdate.day);
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return `${age} yrs`;
  };

  const formatGender = (gender: string) => (gender ? gender.charAt(0).toUpperCase() : '');

  const handleView = async (id: string) => {
    if (viewingId) return;
    setViewingId(id);
    try {
      router.push(`/patients/details/${id}`);
    } finally {
      setTimeout(() => setViewingId(null), 3000);
    }
  };

  const handleEdit = (id: string) => router.push(`/patients/edit-patient/${id}`);

  const handleDeleteClick = (id: string) => {
    setSelectedPatientId(id);
    setShowDeleteModal(true);
  };

  const handleDeletePatient = async () => {
    if (!selectedPatientId) return;

    try {
      const success = await deletePatient(selectedPatientId);
      if (success) {
        setPatients((prev) => prev.filter((p) => p.id !== selectedPatientId));
        showNotification({
          message: 'Patient supprimé avec succès !',
          variant: 'success'
        });
      } else {
        showNotification({
          message: "Échec de la suppression du patient",
          variant: 'danger'
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification({
        message: "Une erreur est survenue lors de la suppression",
        variant: 'danger'
      });
    } finally {
      setShowDeleteModal(false);
      setSelectedPatientId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const pages: (number | string)[] = [];
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) endPage = 4;
      if (currentPage >= totalPages - 2) startPage = totalPages - 3;

      if (startPage > 2) pages.push('...');
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push('...');
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
            className={`page-item ${currentPage === pageNum ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''
              }`}
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
      <PageTitle subName="Patient" title="Liste des patients" />

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de tous les patients{' '}
                <span className="text-muted">({totalCount} Total)</span>
              </CardTitle>

              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Rechercher par nom, email, numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ minWidth: 200 }}
                />
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-hover table-sm table-centered mb-0"
                    style={{ minWidth: 1000 }}
                  >
                    <thead className="bg-light-subtle">
                      <tr>
                        <th>No</th>
                        <th>Nom</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Âge | Genre</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((item, index) => (
                          <tr key={item.id}>
                            <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                            <td>
                              {item.firstName} {item.lastName}
                            </td>
                            <td>{getContactValue(item.contactInfos ?? [], 'EMAIL')}</td>
                            <td>{getContactValue(item.contactInfos ?? [], 'PHONE')}</td>
                            <td>
                              {calculateAge(item.birthdate)}
                              {item.legalGender && ` | ${formatGender(item.legalGender)}`}
                            </td>
                            <td>
                              <span
                                className={`badge bg-${item.status === 'ACTIVE' ? 'success' : 'secondary'
                                  } text-white`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="light"
                                  size="sm"
                                  onClick={() => handleView(item.id)}
                                  disabled={!!viewingId}
                                >
                                  {viewingId === item.id ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    <IconifyIcon icon="solar:eye-broken" />
                                  )}
                                </Button>
                                <Button
                                  variant="soft-primary"
                                  size="sm"
                                  onClick={() => handleEdit(item.id)}
                                >
                                  <IconifyIcon icon="solar:pen-2-broken" />
                                </Button>
                                <Button
                                  variant="soft-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item.id)}
                                >
                                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-4 text-muted">
                            Aucun patient trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>

            <CardFooter>{renderPagination()}</CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce patient ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeletePatient}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientsListPage;