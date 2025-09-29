
'use client';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { API_BASE_PATH } from '@/context/constants';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'react-bootstrap';
import axios from 'axios';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export type Appointment = {
  id: string;
  date: string;
  time: string;
  patient: string;
  doctor: string;
  branch: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
};

export type AppointmentStats = {
  totalAppointments: number;
  completed: number;
  cancellations: number;
};

export type AppointmentDistributionItem = {
  name: string;
  count: number;
};

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const AppointmentsOverview = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All Doctors');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [chartMode, setChartMode] = useState<'doctor' | 'branch'>('doctor');

  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [distributionData, setDistributionData] = useState<AppointmentDistributionItem[]>([]);
  const [distributionTotal, setDistributionTotal] = useState<number>(0);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [dateFilter, setDateFilter] = useState<
    'today' | 'this_week' | 'last_week' | 'this_month' | 'last_month'
  >('this_week');
  const [loading, setLoading] = useState<boolean>(false);

  const calendarRef = useRef<any>(null);

  // ✅ Compute start and end date based on dateFilter
  const { startDate, endDate } = useMemo(() => {
    const now = dayjs();
    switch (dateFilter) {
      case 'this_week':
        return {
          startDate: now.startOf('week').toISOString(),
          endDate: now.endOf('week').toISOString(),
        };
      case 'last_week':
        return {
          startDate: now.subtract(1, 'week').startOf('week').toISOString(),
          endDate: now.subtract(1, 'week').endOf('week').toISOString(),
        };
      case 'this_month':
        return {
          startDate: now.startOf('month').toISOString(),
          endDate: now.endOf('month').toISOString(),
        };
      case 'last_month':
        return {
          startDate: now.subtract(1, 'month').startOf('month').toISOString(),
          endDate: now.subtract(1, 'month').endOf('month').toISOString(),
        };
      default:
        return { startDate: '', endDate: '' };
    }
  }, [dateFilter]);

  // ✅ Fetch doctors & branches (for dropdowns)
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_PATH}/therapists`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setDoctors(data?.data || []);
      console.log('Fetched doctors:', data?.data || []);
    } catch (err) {
      console.error('Error fetching therapists', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_PATH}/branches`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setBranches(data?.data || []);
    } catch (err) {
      console.error('Error fetching branches', err);
    }
  };

  // ✅ Fetch appointment stats
  const fetchAppointmentStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_PATH}/appointments/stats`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        params: { timeFilter: dateFilter },
      });
      setAppointmentStats(data?.data || null);
    } catch (err) {
      console.error('Error fetching stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ✅ Fetch distribution data
  const fetchDistribution = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_PATH}/appointments/distribution`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        params: {
          groupBy: chartMode,
          startDate,
          endDate,
          branch: selectedBranch !== 'All Branches' ? selectedBranch : undefined,
          doctor: selectedDoctor !== 'All Doctors' ? selectedDoctor : undefined,
        },
      });
      setDistributionData(data?.data || []);
      setDistributionTotal(
        (data?.data || []).reduce((sum: number, item: any) => sum + item.count, 0),
      );
    } catch (err) {
      console.error('Error fetching distribution', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchAppointmentStats();
  }, [dateFilter]);

  useEffect(() => {
    fetchDistribution();
  }, [chartMode, selectedDoctor, selectedBranch, startDate, endDate]);

  // ✅ Compute total count for percentage calculations
  const totalAppointments = Array.isArray(distributionData)
    ? distributionData.reduce((sum, item) => sum + item.count, 0) || 1
    : 1;

  return (
    <Col lg={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as="h4">Aperçu des rendez-vous</CardTitle>
            <p className="text-muted mb-0">Résumé basé sur le filtre</p>
          </div>

          {/* ✅ Date Filter Dropdown */}
          <Dropdown>
            <DropdownToggle
              className="btn btn-sm btn-outline-white d-flex align-items-center"
              id="dateFilter"
            >
              <IconifyIcon icon="mdi:calendar-clock" width={18} className="me-1" />
              {dateFilter.replace('_', ' ').toUpperCase()}
            </DropdownToggle>
            <DropdownMenu>
              {[
                { label: 'This Week', value: 'this_week' },
                { label: 'Last Week', value: 'last_week' },
                { label: 'This Month', value: 'this_month' },
                { label: 'Last Month', value: 'last_month' },
              ].map((f) => (
                <DropdownItem
                  key={f.value}
                  onClick={() => setDateFilter(f.value as any)}
                  active={dateFilter === f.value}
                >
                  {f.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </CardHeader>

        <CardBody>
          {/* ✅ Doctor & Branch Dropdowns */}
          <Row className="mb-3">
            <Col md={6}>
              <Dropdown>
                <DropdownToggle className="btn btn-sm btn-outline-primary w-100">
                  {selectedDoctor}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => setSelectedDoctor('All Doctors')}>
                    All Doctors
                  </DropdownItem>
                  {doctors.map((doc) => (
                    <DropdownItem
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                    >
                      {doc.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>
            <Col md={6}>
              <Dropdown>
                <DropdownToggle className="btn btn-sm btn-outline-success w-100">
                  {selectedBranch}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => setSelectedBranch('All Branches')}>
                    All Branches
                  </DropdownItem>
                  {branches.map((br) => (
                    <DropdownItem
                      key={br.id}
                      onClick={() => setSelectedBranch(br.id)}
                    >
                      {br.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>

          {/* Top Metrics */}
          <Row className="g-2 text-center mb-3">
            <Col lg={4}>
              <div className="border bg-light-subtle p-2 rounded">
                <p className="text-muted mb-1">Nombre total de rendez-vous</p>
                <h5 className="text-dark mb-1">
                  {statsLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    (appointmentStats?.totalAppointments ?? totalAppointments)
                  )}
                </h5>
              </div>
            </Col>
            <Col lg={4}>
              <div className="border bg-light-subtle p-2 rounded">
                <p className="text-muted mb-1">Complété</p>
                <h5 className="text-dark mb-1">
                  {statsLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    (appointmentStats?.completed ?? 0)
                  )}
                </h5>
              </div>
            </Col>
            <Col lg={4}>
              <div className="border bg-light-subtle p-2 rounded">
                <p className="text-muted mb-1">Annulations</p>
                <h5 className="text-dark mb-1">
                  {statsLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    (appointmentStats?.cancellations ?? 0)
                  )}
                </h5>
              </div>
            </Col>
          </Row>

          {/* Distribution Chart */}
          <Row className="mt-4">
            <Col md={12}>
              {loading ? (
                <Spinner animation="border" />
              ) : (
                <ReactApexChart
                  type="pie"
                  series={distributionData.map((d) => d.count)}
                  options={{
                    labels: distributionData.map((d) => d.name),
                    legend: { position: 'bottom' },
                  }}
                  height={300}
                />
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default AppointmentsOverview;
