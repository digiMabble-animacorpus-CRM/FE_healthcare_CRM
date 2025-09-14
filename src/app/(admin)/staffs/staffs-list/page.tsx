'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
import type { StaffType } from '@/types/data';
import Image from 'next/image';
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
import { getAllStaff } from '@/helpers/staff';
import avatar1 from '@/assets/images/users/avatar-1.jpg';

const PAGE_LIMIT = 10;
const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Namur'];

const StaffListPage = () => {
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
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

  const fetchStaffList = async (page: number) => {
    setLoading(true);
    try {
      const { from, to } = getDateRange();
      const response = await getAllStaff(
        page,
        PAGE_LIMIT,
        selectedBranch || undefined,
        from,
        to,
        searchTerm,
      );
      setStaffList(response.data);
      setTotalPages(Math.ceil(response.totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList(currentPage);
  }, [currentPage, selectedBranch, searchTerm, dateFilter]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleView = (id: any) => router.push(`/staffs/staffs-details/${id}`);
  const handleEdit = (id: any) => router.push(`/staffs/staffs-form/${id}/edit`);
  const handlePermission = (id: string) => router.push(`/staffs/staffs-form/${id}/permission`);

  const handleDelete = (id: string) => {
    setSelectedStaffId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStaffId) return;
    try {
      await fetch(`/api/therapists/${selectedStaffId}`, {
        method: 'DELETE',
      });
      fetchStaffList(currentPage);
    } catch (error) {
      console.error('Failed to delete staff:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedStaffId(null);
    }
  };

  const calculateAge = (dob: string): number => {
    if (!dob) return 25;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) age--;
    return age;
  };

  const formatGender = (gender: string): string => (gender ? gender.charAt(0).toUpperCase() : '');

  return (
    <>
      <PageTitle subName="Staff" title="Staff List" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                All Doctor List
              </CardTitle>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par nom, email, numéro..."
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
                    {selectedBranch || 'Filtrer par succursale'}
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
                        <th>Name</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Age | Gender</th>
                        <th>Branch</th>
                        <th>Specialist</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Image
                                src={avatar1}
                                className="img-fluid me-2 avatar-sm rounded-circle"
                                alt="avatar-1"
                              />
                              <span>Dr.{staff?.name}</span>
                            </div>
                          </td>
                          <td>{staff?.email}</td>
                          <td>{staff?.phoneNumber}</td>
                          <td>
                            {calculateAge(staff?.dob ?? '')} yrs |{' '}
                            {formatGender(staff?.gender || '')}
                          </td>
                          <td>
                            {staff?.branchesDetailed.map((b: { code: any }) => b.code).join(', ')}
                          </td>
                          <td>{staff?.role?.label}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleView(staff._id)}
                              >
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEdit(staff._id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
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
              <nav>
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
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce personnel ?</Modal.Body>
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

export default StaffListPage;
