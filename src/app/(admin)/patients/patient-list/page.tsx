'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
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
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import '@/assets/scss/components/_edittogglebtn.scss';

// API helper function to get patient list with filters
const getPatientList = async ({
  searchText = '',
  pageNo = 1,
  limit = 10,
  branch = '',
  fromDate = '',
  toDate = '',
}: {
  searchText?: string;
  pageNo?: number;
  limit?: number;
  branch?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const params = new URLSearchParams();
  if (searchText) params.append('searchText', searchText);
  params.append('pageNo', pageNo.toString());
  params.append('limit', limit.toString());
  if (branch) params.append('branch', branch);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  const res = await fetch(`http://localhost:8080/api/v1/customers?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// API helper to fetch detailed info of a patient by ID
const getPatientById = async (id: string) => {
  const res = await fetch(`http://localhost:8080/api/v1/customers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch patient details');
  return res.json();
};

// Constants
const PAGE_SIZE = 10;
const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Anima Corpus Namur'];

const PatientsListPage = () => {
  const [allPatients, setAllPatients] = useState<PatientType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientType | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const router = useRouter();

  const getDateRangeForAPI = () => {
    const now = dayjs();
    switch (dateFilter) {
      case 'today':
        return {
          fromDate: now.startOf('day').format('YYYY-MM-DD'),
          toDate: now.endOf('day').format('YYYY-MM-DD'),
        };
      case 'this_week':
        return {
          fromDate: now.startOf('week').format('YYYY-MM-DD'),
          toDate: now.endOf('week').format('YYYY-MM-DD'),
        };
      case '15_days':
        return {
          fromDate: now.subtract(15, 'day').startOf('day').format('YYYY-MM-DD'),
          toDate: now.endOf('day').format('YYYY-MM-DD'),
        };
      case 'this_month':
        return {
          fromDate: now.startOf('month').format('YYYY-MM-DD'),
          toDate: now.endOf('month').format('YYYY-MM-DD'),
        };
      case 'this_year':
        return {
          fromDate: now.startOf('year').format('YYYY-MM-DD'),
          toDate: now.endOf('year').format('YYYY-MM-DD'),
        };
      default:
        return { fromDate: '', toDate: '' };
    }
  };

  // Fetch patients list with filters and pagination
  const fetchPatients = async () => {
    setLoading(true);
    const { fromDate, toDate } = getDateRangeForAPI();
    try {
      const response = await getPatientList({
        searchText: searchTerm,
        pageNo: currentPage,
        limit: PAGE_SIZE,
        branch: selectedBranch || '',
        fromDate,
        toDate,
      });
      setAllPatients(response.data || []);
      setTotalPages(Math.ceil((response.totalCount || 0) / PAGE_SIZE));
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setAllPatients([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, currentPage, selectedBranch, dateFilter]);

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

  // Handle View: Fetch details and show modal
  const handleView = async (id: string) => {
    try {
      const patient = await getPatientById(id);
      setSelectedPatientDetails(patient);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch patient details', error);
    }
  };

  // Edit button: navigate to edit page (edit page should handle fetching & patch)
  const handleEditClick = (id: string) => {
    router.push(`/patients/edit-patient/${id}`);
  };

  // Delete button: confirm modal open
  const handleDeleteClick = (id: string) => {
    setSelectedPatientId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete patient via API
  const handleConfirmDelete = async () => {
    if (!selectedPatientId) return;
    try {
      await fetch(`http://localhost:8080/api/v1/customers/${selectedPatientId}`, { method: 'DELETE' });
      setAllPatients(allPatients.filter((p) => p.id !== selectedPatientId));
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setSelectedPatientId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedPatientDetails(null);
  };

  return (
    <>
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
                      {allPatients.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            {item.firstname} {item.lastname}
                          </td>
                          <td>{item.emails}</td>
                          <td>{item.phones}</td>
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
                                  <DropdownItem onClick={() => handleEditClick(item.id)}>
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

      {/* View Patient Details Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Patient Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatientDetails ? (
            <div>
              <p><strong>Name:</strong> {selectedPatientDetails.firstname} {selectedPatientDetails.lastname}</p>
              <p><strong>Email:</strong> {selectedPatientDetails.emails}</p>
              <p><strong>Phone:</strong> {selectedPatientDetails.phones}</p>
              <p><strong>Age:</strong> {calculateAge(selectedPatientDetails.birthdate)}</p>
              <p><strong>Gender:</strong> {formatGender(selectedPatientDetails.legalgender ?? '')}</p>
              <p><strong>City:</strong> {selectedPatientDetails.city}</p>
              <p><strong>Status:</strong> {selectedPatientDetails.status}</p>
              {/* Add more fields as needed */}
            </div>
          ) : (
            'Loading...'
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientsListPage;
