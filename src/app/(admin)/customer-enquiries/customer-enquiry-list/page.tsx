'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllCustomerEnquiries } from '@/helpers/data';
import { useEffect, useState } from 'react';
import type { CustomerEnquiriesType } from '@/types/data';
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

const PAGE_LIMIT = 10;
const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Anima Corpus Namur'];

const CustomersListPage = () => {
  const [enquirys, setEnquirys] = useState<CustomerEnquiriesType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const router = useRouter();

  const getDateRange = () => {
    const now = dayjs();
    switch (dateFilter) {
      case 'today':
        return {
          from: now.startOf('day').toISOString(),
          to: now.endOf('day').toISOString(),
        };
      case 'this_week':
        return {
          from: now.startOf('week').toISOString(),
          to: now.endOf('week').toISOString(),
        };
      case '15_days':
        return {
          from: now.subtract(15, 'day').startOf('day').toISOString(),
          to: now.endOf('day').toISOString(),
        };
      case 'this_month':
        return {
          from: now.startOf('month').toISOString(),
          to: now.endOf('month').toISOString(),
        };
      case 'this_year':
        return {
          from: now.startOf('year').toISOString(),
          to: now.endOf('year').toISOString(),
        };
      default:
        return {};
    }
  };

  const fetchEnquirys = async (page: number) => {
    setLoading(true);
    try {
      const { from, to } = getDateRange();
      const response = await getAllCustomerEnquiries(
        page,
        PAGE_LIMIT,
        selectedBranch || undefined,
        from,
        to,
        searchTerm,
      );
      setEnquirys(response.data);
      setTotalPages(Math.ceil(response.totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error('Failed to fetch enquiries data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquirys(currentPage);
  }, [currentPage, selectedBranch, searchTerm, dateFilter]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleView = (id: string) => {
    router.push(`/customer-enquiries/details/${id}`);
  };

  const handleEditClick = (id: string) => {
    router.push(`/customer-enquiries/edit-enquiry/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPatientId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPatientId) return;

    try {
      await fetch(`/api/enquirys/${selectedPatientId}`, {
        method: 'DELETE',
      });

      fetchEnquirys(currentPage);
    } catch (error) {
      console.error('Failed to delete enquiries:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedPatientId(null);
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) age--;
    return age;
  };

  const formatGender = (gender: string): string => {
    if (!gender) return '';
    return gender.charAt(0).toUpperCase();
  };

  return (
    <>
      <PageTitle subName="Customer Enquiries" title="Customer Enquiry List" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                All Customer Enquiry List
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by name, email, number..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <Dropdown>
                  <DropdownToggle
                    className="btn btn-sm btn-outline-white d-flex align-items-center"
                    id="branchFilter"
                  >
                    <IconifyIcon
                      icon="material-symbols:location-on-outline"
                      width={18}
                      className="me-1"
                    />
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
                  <DropdownToggle
                    className="btn btn-sm btn-outline-white d-flex align-items-center"
                    id="dateFilter"
                  >
                    <IconifyIcon icon="mdi:calendar-clock" width={18} className="me-1" />
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
                  <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 20 }}>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="customCheck1" />
                            <label className="form-check-label" htmlFor="customCheck1" />
                          </div>
                        </th>
                        <th>Customer name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Age | Gender</th>
                        <th>Branch</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Last Activity</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquirys.map((item: CustomerEnquiriesType, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`check-${idx}`}
                              />
                            </div>
                          </td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.number}</td>
                          <td>
                            {calculateAge(item.dob)} yrs | {formatGender(item.gender)}
                          </td>
                          <td>{item.branch}</td>
                          <td>{item.source}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                item.status === 'new' ? 'success' : 'danger'
                              } text-white fs-12 px-2 py-1`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td>{item.lastUpdated}</td>
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
                              <Dropdown>
                                <Dropdown.Toggle
                                  className="editToggleBtn"
                                  variant="soft-primary"
                                  size="sm"
                                  id={`edit-dropdown-${item._id}`}
                                  style={{ padding: '4px 8px' }}
                                >
                                  <IconifyIcon icon="solar:pen-2-broken" className="fs-18" />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEditClick(item._id)}>
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => router.push(`/customers/edit/${item._id}`)}
                                  >
                                    Edit Medical Info
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>

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
                      Previous
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
                      Next
                    </Button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this customer? This action cannot be undone.
        </Modal.Body>
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

export default CustomersListPage;
