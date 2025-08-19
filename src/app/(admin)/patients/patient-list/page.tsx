'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState, useMemo } from 'react';
import type { PatientType } from '@/types/data';
import dayjs from 'dayjs';
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
  Alert,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import '@/assets/scss/components/_edittogglebtn.scss';
import { getAllPatient, deletePatient } from '@/helpers/patient';

const PAGE_SIZE = 500;
const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Anima Corpus Namur'];

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
  const router = useRouter();

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getAllPatient(1, 10000);
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
      data = data.filter((p) =>
        (p?.firstname ?? '').toLowerCase().includes(term) ||
        (p?.lastname ?? '').toLowerCase().includes(term) ||
        (p?.emails ?? '').toLowerCase().includes(term) ||
        (p?.phones ? p.phones.join(' ').toLowerCase() : '').includes(term)
      );
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

  const handleView = (id: string) => router.push(`/patients/details/${id}`);
  const handleEditClick = (id: string) => router.push(`/patients/edit-patient/${id}`);
  const handleDeleteClick = (id: string) => {
    setSelectedPatientId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPatientId) return;

    try {
      const success = await deletePatient(selectedPatientId);
      if (success) {
        setAllPatients((prev) => prev.filter((p) => p.id !== selectedPatientId));
        setShowSuccessMessage(true);
      } else {
        console.error('Failed to delete patient');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setShowDeleteModal(false);
      setSelectedPatientId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      {showSuccessMessage && (
        <Alert
          variant="success"
          onClose={() => setShowSuccessMessage(false)}
          dismissible
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050, minWidth: 200 }}
        >
          Patient deleted successfully!
        </Alert>
      )}

      <PageTitle subName="Patient" title="Patient List" />

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                All Patient List
              </CardTitle>

              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search by name, email, number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ minWidth: 200 }}
                />

                <Dropdown>
                  <DropdownToggle className="btn btn-sm btn-outline-white">
                    {selectedBranch || 'Filter by Branch'}
                  </DropdownToggle>
                  <DropdownMenu>
                    {BRANCHES.map((branch) => (
                      <DropdownItem
                        key={branch}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setCurrentPage(1);
                        }}
                        active={selectedBranch === branch}
                      >
                        {branch}
                      </DropdownItem>
                    ))}
                    {selectedBranch && (
                      <DropdownItem
                        className="text-danger"
                        onClick={() => {
                          setSelectedBranch(null);
                          setCurrentPage(1);
                        }}
                      >
                        Clear Branch Filter
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>

                <Dropdown>
                  <DropdownToggle className="btn btn-sm btn-outline-white">
                    {dateFilter === 'all'
                      ? 'Filter by Date'
                      : dateFilter.replace('_', ' ').toUpperCase()}
                  </DropdownToggle>
                  <DropdownMenu>
                    {[
                      { label: 'Today', value: 'today' },
                      { label: 'This Week', value: 'this_week' },
                      { label: 'Last 15 Days', value: '15_days' },
                      { label: 'This Month', value: 'this_month' },
                      { label: 'This Year', value: 'this_year' },
                    ].map((f) => (
                      <DropdownItem
                        key={f.value}
                        onClick={() => {
                          setDateFilter(f.value);
                          setCurrentPage(1);
                        }}
                        active={dateFilter === f.value}
                      >
                        {f.label}
                      </DropdownItem>
                    ))}
                    {dateFilter !== 'all' && (
                      <DropdownItem
                        className="text-danger"
                        onClick={() => {
                          setDateFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        Clear Date Filter
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
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
                    style={{ minWidth: 1100 }}
                  >
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 30 }}>
                          <input type="checkbox" />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Age | Gender</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input type="checkbox" />
                          </td>
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
                            {item.legalgender ? ` yrs | ${formatGender(item.legalgender)}` : ' yrs'}
                          </td>
                          <td>{item.city}</td>
                          <td>
                            <span
                              className={`badge bg-${item.status === 'new' ? 'success' : 'danger'} text-white`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="light" size="sm" onClick={() => handleView(item.id)}>
                                <IconifyIcon icon="solar:eye-broken" />
                              </Button>
                              <Dropdown>
                                <DropdownToggle className="editToggleBtn" size="sm">
                                  <IconifyIcon icon="solar:pen-2-broken" />
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem onClick={() => handleEditClick(item?.id)}>
                                    Edit
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(item.id)}
                              >
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
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
              <ul className="pagination justify-content-end mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                </li>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
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
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this patient?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientsListPage;
