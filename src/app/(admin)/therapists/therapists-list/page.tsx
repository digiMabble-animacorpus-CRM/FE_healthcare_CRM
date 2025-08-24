'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState, useMemo } from 'react';
import type { TherapistType } from '@/types/data';
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
import { deleteTherapist, getAllTherapists } from '@/helpers/therapist';

const PAGE_SIZE = 500;
const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Anima Corpus Namur'];

const TherapistsListPage = () => {
  const [allTherapists, setAllTherapists] = useState<TherapistType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const router = useRouter();

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const response = await getAllTherapists(1, 10000); // fetch all
      console.log(response.data);
      setAllTherapists(response.data || []);
    } catch (err) {
      console.error('Failed to fetch therapists', err);
      setAllTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

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

  const filteredTherapists = useMemo(() => {
    let data = [...allTherapists];

    if (selectedBranch) {
      data = data.filter((t) => t.centerAddress?.includes(selectedBranch));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (t) =>
          (t.firstName?.toLowerCase().includes(term) ?? false) ||
          (t.lastName?.toLowerCase().includes(term) ?? false) ||
          (t.fullName?.toLowerCase().includes(term) ?? false) ||
          (t.contactEmail?.toLowerCase().includes(term) ?? false) ||
          (t.contactPhone?.toLowerCase().includes(term) ?? false),
      );
    }

    const range = getDateRange();
    if (range) {
      data = data.filter((t) => {
        if (!t.appointmentStart) return false;
        const created = dayjs(t.appointmentStart);
        return created.isAfter(range.from) && created.isBefore(range.to);
      });
    }

    return data;
  }, [allTherapists, selectedBranch, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredTherapists.length / PAGE_SIZE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTherapists.slice(start, start + PAGE_SIZE);
  }, [filteredTherapists, currentPage]);

  const handleView = (id: any) => {
    router.push(`/therapists/details/${id}`);
  };

  const handleEditClick = (id: any) => router.push(`/therapists/edit-therapist/${id}`);

  const handleDeleteClick = (id: any) => {
    setSelectedTherapistId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTherapistId) return;

    try {
      const success = await deleteTherapist(selectedTherapistId);
      if (success) {
        setAllTherapists((prev) => prev.filter((t) => t._id !== selectedTherapistId));
        setShowSuccessMessage(true);
      } else {
        console.error('Failed to delete therapist');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setShowDeleteModal(false);
      setSelectedTherapistId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPhotoUrl = (photo: string) => {
    // Regex to extract URL from markdown style "filename (url)"
    const match = photo.match(/\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : '';
  };

  console.log(currentData)
  return (
    <>
      <PageTitle subName="Therapist" title="Therapists List" />

      {showSuccessMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setShowSuccessMessage(false)}
          className="mb-3"
        >
          Therapist deleted successfully!
        </Alert>
      )}

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                All Therapist List
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
                  <DropdownToggle className="btn btn-sm btn-primary dropdown-toggle text-white">
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
                        <th>Profile Pic</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Job Title</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <td>
                              {item.imageUrl && item.imageUrl !== "null" && item.imageUrl.trim() !== "" ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.firstName}
                                  className="rounded-circle object-cover"
                                  style={{ width: "40px", height: "40px" }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: "#e7ddff",
                                    color: "#341539",
                                    fontSize: "20px", // looks balanced in 40px circle
                                    fontWeight: "bold",
                                  }}
                                >
                                  {item.firstName?.charAt(0).toUpperCase()}
                                </div>
                              )}

                            </td>

                          </td>
                          <td>
                            {item.firstName} {item.lastName}
                          </td>
                          <td>{item.contactEmail}</td>
                          <td>{item.centerPhoneNumber}</td>
                          <td>{item.centerAddress}</td>
                          <td>{item.jobTitle}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleView(item._key)}
                              >
                                <IconifyIcon icon="solar:eye-broken" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEditClick(item._key)}
                              >
                                <IconifyIcon icon="solar:pen-2-broken" />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(item._key)}
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this therapist?</Modal.Body>
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

export default TherapistsListPage;
