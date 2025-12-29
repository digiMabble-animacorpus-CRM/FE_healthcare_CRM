'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Spinner,
  Badge,
  Dropdown,
} from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';

const PAGE_LIMIT = 5;

type AppointmentManagementType = {
  id: number;
  action: string;
  therapist_name: string | null;
  appointment_date: string;
  appointment_time: string;
  preferred_new_date: string | null;
  preferred_new_time: string | null;
  location: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone?: string;
};

const AppointmentManagementPage = () => {
  const [appointments, setAppointments] = useState<AppointmentManagementType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new_request' | 'cancel' | 'reschedule'>('all');
  const [dateFilter, setDateFilter] = useState<string>('All');

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_PATH}/new-requests-appointment-management`, {
        params: {
          page: currentPage,
          limit: PAGE_LIMIT,
          search: searchTerm,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.appointment_management || [];
      console.log(data, "data")
      setAppointments(Array.isArray(data) ? data : []);
      console.log(data, "data")
      const totalCount = response.data.total_count || data.length;
      setTotalPages(Math.ceil(totalCount / PAGE_LIMIT) || 1);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Stats should be calculated from the full data or separate API call.
  // For now, we calculate from the current visible set.
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      new: appointments.filter((a) => a.action === 'new_request' || a.action === 'new').length,
      cancel: appointments.filter((a) => a.action === 'cancel').length,
      reschedule: appointments.filter((a) => a.action === 'reschedule').length,
    };
  }, [appointments]);

  // Apply filters locally on the fetched page data
  const filteredList = useMemo(() => {
    let list = [...appointments];
    if (filter !== 'all') {
      const targetAction = filter === 'new_request' ? ['new_request', 'new'] : [filter];
      list = list.filter((a) => targetAction.includes(a.action));
    }
    return list;
  }, [appointments, filter]);

  return (
    <>
      <PageTitle subName="Management" title="Appointment Requests" />

      {/* Top Stats Cards */}
      <Row className="mb-4 g-2">
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm ">
            <CardBody className="p-2 p-md-3">
              <h3 className="fw-bold mb-0">{stats.total}</h3>
              <span className="text-muted small">Total Requests</span>
            </CardBody>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm ">
            <CardBody className="p-2 p-md-3">
              <h3 className="fw-bold text-success mb-0">{stats.new}</h3>
              <span className="text-muted small">New Request</span>
            </CardBody>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm ">
            <CardBody className="p-2 p-md-3">
              <h3 className="fw-bold text-danger mb-0">{stats.cancel}</h3>
              <span className="text-muted small">Cancellation</span>
            </CardBody>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm ">
            <CardBody className="p-2 p-md-3">
              <h3 className="fw-bold text-warning mb-0">{stats.reschedule}</h3>
              <span className="text-muted small">Reschedule</span>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Controls: Search, Filters, Date */}
      <div className="mb-4">
        <Row className="g-3 align-items-center">
          <Col md={8}>
            <div className="w-100 w-md-auto overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
              <div className="d-flex flex-nowrap gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'light'}
                  className="rounded-pill btn-sm px-3 text-nowrap"
                  onClick={() => setFilter('all')}
                >
                  All{' '}
                  <Badge bg="secondary" className="ms-1">
                    {stats.total}
                  </Badge>
                </Button>
                <Button
                  variant={filter === 'new_request' ? 'success' : 'light'}
                  className="rounded-pill btn-sm px-3 text-nowrap"
                  onClick={() => setFilter('new_request')}
                >
                  New Request{' '}
                  <Badge bg="success-subtle" className="text-success ms-1">
                    {stats.new}
                  </Badge>
                </Button>
                <Button
                  variant={filter === 'cancel' ? 'danger' : 'light'}
                  className="rounded-pill btn-sm px-3 text-nowrap"
                  onClick={() => setFilter('cancel')}
                >
                  Cancellation{' '}
                  <Badge bg="danger-subtle" className="text-danger ms-1">
                    {stats.cancel}
                  </Badge>
                </Button>
                <Button
                  variant={filter === 'reschedule' ? 'warning' : 'light'}
                  className="rounded-pill btn-sm px-3 text-nowrap"
                  onClick={() => setFilter('reschedule')}
                >
                  Reschedule{' '}
                  <Badge bg="warning-subtle" className="text-warning ms-1">
                    {stats.reschedule}
                  </Badge>
                </Button>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex justify-content-between align-items-center gap-2">
              <div className="w-auto">
                <Dropdown onSelect={(val) => setDateFilter(val || 'All')}>
                  <Dropdown.Toggle
                    variant="white"
                    className="btn-sm border shadow-sm px-3 bg-white d-flex align-items-center gap-2"
                  >
                    <IconifyIcon icon="solar:calendar-broken" className="text-primary fs-18" />
                    {dateFilter}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item eventKey="Today">Today</Dropdown.Item>
                    <Dropdown.Item eventKey="This Week">This Week</Dropdown.Item>
                    <Dropdown.Item eventKey="This Month">This Month</Dropdown.Item>
                    <Dropdown.Item eventKey="This Year">This Year</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="All">All Time</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="search-box flex-grow-1">
                <input
                  type="text"
                  className="form-control shadow-sm border-0"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {filteredList.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm overflow-hidden">
              <CardBody className="p-3 p-md-4">
                <Row className="align-items-start">
                  <Col xs="auto">
                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48 }}
                    >
                      <IconifyIcon
                        icon="solar:user-circle-broken"
                        className="fs-24 text-secondary"
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h5 className="mb-0 fw-bold">
                        {item.first_name} {item.last_name || ''}
                      </h5>
                      <Badge
                        bg={
                          item.action === 'cancel'
                            ? 'danger-subtle'
                            : item.action === 'reschedule'
                              ? 'warning-subtle'
                              : 'success-subtle'
                        }
                        className={
                          item.action === 'cancel'
                            ? 'text-danger'
                            : item.action === 'reschedule'
                              ? 'text-warning'
                              : 'text-success'
                        }
                      >
                        {item.action === 'cancel'
                          ? 'Cancellation'
                          : item.action === 'reschedule'
                            ? 'Reschedule'
                            : 'New Request'}
                      </Badge>
                    </div>
                    <div className="text-muted small">
                      <p className="mb-1">
                        <IconifyIcon icon="solar:phone-broken" className="me-2" />
                        {item.phone || 'No phone provided'}
                      </p>
                      <p className="mb-1">
                        <IconifyIcon icon="solar:map-point-broken" className="me-2" />
                        {item.location || 'Location N/A'}
                      </p>
                      <p className="mb-0">
                        <IconifyIcon icon="solar:user-id-broken" className="me-2" />
                        Therapist:{' '}
                        <span className="text-dark fw-medium">
                          {item.therapist_name || 'Not Assigned'}
                        </span>
                      </p>
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    <div className="d-flex flex-column align-items-md-end">
                      <span className="text-muted small mb-1">
                        <IconifyIcon icon="solar:calendar-broken" className="me-1 text-primary" />
                        {item.action === 'cancel' ? 'Original date:' : 'Requested date:'}
                      </span>
                      <span className="fw-bold">
                        {item.appointment_date} — {item.appointment_time?.substring(0, 5)}
                      </span>
                      {item.action === 'reschedule' && item.preferred_new_date && (
                        <div className="mt-2 text-primary small">
                          <IconifyIcon icon="solar:arrow-right-up-broken" className="me-1" />
                          Proposed:{' '}
                          <strong>
                            {item.preferred_new_date} @ {item.preferred_new_time?.substring(0, 5)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
                <div className="mt-3 p-2 px-3 bg-light rounded-3 d-flex align-items-center border-start border-primary border-3">
                  <IconifyIcon
                    icon="solar:magic-stick-3-bold-duotone"
                    className="text-primary me-2 fs-18"
                  />
                  <span className="small text-dark">
                    {item.action === 'cancel'
                      ? 'Booking cancelled. Slot is now open for other patients.'
                      : item.action === 'reschedule'
                        ? `Patient requested a change to ${item.preferred_new_date}. Check calendar availability.`
                        : 'New patient request. Suggested action: Send SMS confirmation.'}
                  </span>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="outline-light" className="text-danger border-0 btn-sm px-4">
                    <IconifyIcon icon="solar:close-circle-broken" className="me-1" /> Decline
                  </Button>
                  <Button
                    variant="primary"
                    className="btn-sm px-4 shadow-sm"
                    style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
                  >
                    <IconifyIcon icon="solar:check-read-broken" className="me-1" /> Approve
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          {filteredList.length === 0 && !loading && (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <IconifyIcon icon="solar:clipboard-list-broken" className="fs-48 text-muted mb-2" />
              <p className="text-muted">No requests found for this selection.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <nav className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            Page {currentPage} of {totalPages}
          </span>
          <ul className="pagination pagination-sm justify-content-end mb-0">
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
              <li className={`page-item ${currentPage === index + 1 ? 'active' : ''}`} key={index}>
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
      )}
    </>
  );
};

export default AppointmentManagementPage;
