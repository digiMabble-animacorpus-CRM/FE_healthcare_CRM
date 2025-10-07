'use client';

import '@/assets/scss/components/_edittogglebtn.scss';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { deletePatient, getAllPatient } from '@/helpers/patient';
import type { PatientType } from '@/types/data';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useNotificationContext } from '@/context/useNotificationContext';
import {
  Alert,
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

const PAGE_SIZE = 100;

const PatientsListPage = () => {
  const [allPatients, setAllPatients] = useState<PatientType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
const { showNotification } = useNotificationContext();
  const router = useRouter();

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getAllPatient(1, 1000);
      setAllPatients(response.data || []);
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setAllPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const getDateRange = () => {
    const now = dayjs();
    switch (dateFilter) {
      case 'today':
        return { from: now.startOf('day'), to: now.endOf('day') };
      case 'this_week':
        return { from: now.startOf('week'), to: now.endOf('week') };
      case '15_days':
        return { from: now.subtract(15, 'day').startOf('day'), to: now.endOf('day') };
      case 'this_month':
        return { from: now.startOf('month'), to: now.endOf('month') };
      case 'this_year':
        return { from: now.startOf('year'), to: now.endOf('year') };
      default:
        return null;
    }
  };

  const filteredPatients = useMemo(() => {
    let data = [...allPatients];

    if (selectedBranch) {
      data = data.filter((p) => p.city === selectedBranch);
    }

   if (searchTerm.trim()) {
  const term = searchTerm.trim().toLowerCase();
  data = data.filter((p) => {
    const fullName = `${p?.firstname ?? ''} ${p?.lastname ?? ''}`.toLowerCase();
    const emails = (p?.emails ?? '').toLowerCase();
    const phones = Array.isArray(p.phones) ? p.phones.join(' ').toLowerCase() : (p.phones ?? '');
    
    return fullName.includes(term) || emails.includes(term) || phones.includes(term);
  });
}

    const range = getDateRange();
    if (range) {
      data = data.filter((p) => {
        if (!p.createdAt) return false;
        const created = dayjs(p.createdAt);
        return created.isAfter(range.from) && created.isBefore(range.to);
      });
    }

    return data;
  }, [allPatients, selectedBranch, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPatients.slice(start, start + PAGE_SIZE);
  }, [filteredPatients, currentPage]);

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const formatGender = (gender: string) => (gender ? gender.charAt(0).toUpperCase() : '');

  const handleView = (id: any) => router.push(`/patients/details/${id}`);
  const handleEditClick = (id: any) => router.push(`/patients/edit-patient/${id}`);
  const handleDeleteClick = (id: any) => {
    setSelectedPatientId(id);
    setShowDeleteModal(true);
  };

const handleDeletePatient = async () => {
  if (!selectedPatientId) return; // exit early if null

  try {
    const success = await deletePatient(selectedPatientId);
    if (success) {
      setAllPatients((prev) => prev.filter((p) => p.id !== selectedPatientId));
      showNotification({ message: 'Patient supprimé avec succès !', variant: 'success' });
    } else {
      showNotification({ message: "Échec de la suppression du patient", variant: 'danger' });
    }
  } catch (err) {
    console.error('Delete error:', err);
    showNotification({ message: "Une erreur est survenue lors de la suppression", variant: 'danger' });
  } finally {
    setShowDeleteModal(false);
    setSelectedPatientId(null);
  }
};

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages) return;
  setCurrentPage(page);
};

  function handleConfirmDelete(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    handleDeletePatient();
  }

  return (
    <>
      {showSuccessMessage && (
         <>
    {/* Your table / content goes here */}

    {/* No more inline Alert needed, notifications are handled via showNotification */}
  </>

      )}

      <PageTitle subName="Patient" title="Liste des patients" />

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de tous les patients{' '}
                <span className="text-muted">({filteredPatients.length} Total)</span>
              </CardTitle>

              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Rechercher par nom, email, numéro..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
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
                        <th>Non</th>
                        <th>Nom</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Âge | Genre</th>
                        <th>Ville</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((item, index) => (
                          <tr key={item.id}>
                            {/* Auto Increment ID */}
                            <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                            <td>
                              {item.firstname} {item.lastname}
                            </td>
                            <td>{item.emails ?? ''}</td>
                            <td>
                              {Array.isArray(item.phones)
                                ? item.phones.join(', ')
                                : item.phones || ''}
                            </td>
                            <td>
                              {calculateAge(item.birthdate)}
                              {item.legalgender
                                ? ` yrs | ${formatGender(item.legalgender)}`
                                : ' yrs'}
                            </td>
                            <td>{item.city}</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  item.status === 'ACTIVE' ? 'success' : 'secondary'
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
                                >
                                  <IconifyIcon icon="solar:eye-broken" />
                                </Button>
                                <Button
                                  variant="soft-primary"
                                  size="sm"
                                  onClick={() => handleEditClick(item.id)}
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

            <CardFooter>
              <ul className="pagination justify-content-end mb-0">
                {/* Previous Button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                </li>

                {/* Always show first page */}
                <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                  <Button variant="link" className="page-link" onClick={() => handlePageChange(1)}>
                    1
                  </Button>
                </li>

                {/* Left dots */}
                {currentPage > 3 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}

                {/* Current Page (if not first/last) */}
                {currentPage !== 1 && currentPage !== totalPages && (
                  <li className="page-item active">
                    <Button variant="link" className="page-link">
                      {currentPage}
                    </Button>
                  </li>
                )}

                {/* Right dots */}
                {currentPage < totalPages - 2 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}

                {/* Always show last page */}
                {totalPages > 1 && (
                  <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </li>
                )}

                {/* Next Button */}
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
            </CardFooter>
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
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientsListPage;
