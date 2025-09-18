'use client';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';

import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import {
  AppointmentDistributionItem,
  AppointmentStats,
  getAppointmentDistribution,
  getAppointmentStats,
} from '@/helpers/dashboard';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export type Appointment = {
  id: string;
  date: string;
  time: string;
  patient: string;
  doctor: string;
  branch: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
};

export type AppointmentsOverviewProps = {
  upcoming: Appointment[];
  upcomingCount: number;
  cancellationsWeek: number;
  completedWeek: number;
};

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Namur'];

const AppointmentsOverview = ({ upcoming }: AppointmentsOverviewProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All Doctors');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [chartMode, setChartMode] = useState<'doctor' | 'branch'>('doctor');
  // const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  // const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'list'>('calendar');
  // const [calendarHeight] = useState('750px');
  const [loading] = useState(false);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const [distributionData, setDistributionData] = useState<AppointmentDistributionItem[]>([]);
  const [distributionTotal, setDistributionTotal] = useState<number>(0);

  const calendarRef = useRef<any>(null);

  // Date range for API calls
  const startDate = dayjs().startOf('week').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('week').format('YYYY-MM-DD');

  // TODO: Map selectedDoctor/selectedBranch to IDs if you have
  const doctorId = selectedDoctor !== 'All Doctors' ? undefined : undefined;
  const branchId = selectedBranch !== 'All Branches' ? undefined : undefined;

  // Fetch appointment stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await getAppointmentStats({
          startDate,
          endDate,
          doctorId,
          branchId,
          timeFilter: 'thisWeek',
        });
        if (response?.stats) setAppointmentStats(response.stats);
        else setAppointmentStats(null);
      } catch {
        setAppointmentStats(null);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [selectedDoctor, selectedBranch, startDate, endDate]);

  // Fetch appointment distribution
  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const response = await getAppointmentDistribution({
          startDate,
          endDate,
          doctorId,
          branchId,
          timeFilter: 'thisWeek',
          groupBy: chartMode,
        });
        if (response) {
          setDistributionData(response.distribution);
          setDistributionTotal(response.totalAppointments || 1);
        } else {
          setDistributionData([]);
          setDistributionTotal(1);
        }
      } catch {
        setDistributionData([]);
        setDistributionTotal(1);
      }
    };
    fetchDistribution();
  }, [selectedDoctor, selectedBranch, startDate, endDate, chartMode]);

  // Compute total count for percentage calculations
  const totalAppointments = Array.isArray(distributionData)
    ? distributionData.reduce((sum, item) => sum + item.count, 0) || 1
    : 1;

  // Dropdown source lists from upcoming appointments
  const allDoctors = Array.from(new Set(upcoming.map((a) => a.doctor)));
  const allBranches = Array.from(new Set(upcoming.map((a) => a.branch)));

  // Prepare chart data from distributionData
  const chartCategories = distributionData.map((item) => item.name);
  const chartData = distributionData.map((item) => item.count);

  /*
  // Chart options and series for ApexCharts
  const chartOptions: ApexOptions = {
    chart: { id: 'appointments-chart', toolbar: { show: false } },
    xaxis: {
      categories: chartCategories,
      labels: { rotate: -45 },
      title: { text: chartMode === 'doctor' ? 'Doctor' : 'Branch' },
    },
    stroke: { curve: 'smooth' },
    dataLabels: { enabled: false },
    colors: ['#0d6efd'],
    tooltip: { shared: true, intersect: false },
    markers: { size: 4 },
    yaxis: { title: { text: 'Appointments' } },
  };
  const chartSeries = [{ name: 'Appointments', data: chartData }];
  */

  return (
    <Col lg={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as="h4">Aperçu des rendez-vous</CardTitle>
            <p className="text-muted mb-0">Résumé hebdomadaire</p>
          </div>

          {/*
          <div className="d-flex gap-2">
            {/* Doctor Dropdown */}
          {/* <Dropdown>
              <DropdownToggle
                as="a"
                className="btn btn-sm btn-outline-light rounded content-none icons-center"
              >
                {selectedDoctor} <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem onClick={() => setSelectedDoctor('All Doctors')}>
                  Tous les thérapeutes
                </DropdownItem>
                {allDoctors.map((doc) => (
                  <DropdownItem key={doc} onClick={() => setSelectedDoctor(doc)}>
                    {doc}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown> */}

          {/* Branch Dropdown */}
          {/* <Dropdown>
              <DropdownToggle
                as="a"
                className="btn btn-sm btn-outline-light rounded content-none icons-center"
              >
                {selectedBranch} <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem onClick={() => setSelectedBranch('All Branches')}>
                  Toutes les succursales
                </DropdownItem>
                {allBranches.map((b) => (
                  <DropdownItem key={b} onClick={() => setSelectedBranch(b)}>
                    {b}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown> */}
          {/*
          </div>
          */}
        </CardHeader>

        <CardBody>
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

          {/*
          // Chart + Calendar
          <Row className="g-3">
            <Col lg={6}>
              <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={250} />
            </Col>

            <Col lg={6} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                ) : calendarViewMode === 'calendar' ? (
                  <Calendar />
                ) : (
                  <div className="p-3 border rounded bg-white" style={{ height: calendarHeight, overflowY: 'auto' }}>
                    {upcoming.length === 0 ? (
                      <p className="text-muted">Aucun rendez-vous trouvé.</p>
                    ) : (
                      upcoming.map((appt) => (
                        <div key={appt.id} className="border-bottom py-2">
                          <strong>{appt.patient}</strong>
                          <div>{dayjs(`${appt.date}T${appt.time}`).format('MMM D, YYYY h:mm A')}</div>
                          <small className="text-muted">
                            {appt.doctor} - {appt.branch}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>


          // Appointments Breakdown
          <h5 className="mt-4 mb-2 text-primary fw-bold">Répartition des rendez-vous</h5>
          <p className="text-muted mb-3">
            Affichage des rendez-vous pour{' '}
            <strong>{chartMode === 'doctor' ? selectedDoctor : selectedBranch}</strong>.
          </p>

          {distributionLoading ? (
            <Spinner animation="border" />
          ) : (
            <Row className="g-3 mb-3">
              {distributionData.map((item, idx) => {
                const percent = Math.round((item.count / totalAppointments) * 100);
                const avatar = AVATARS[idx % AVATARS.length];
                return (
                  <Col lg={3} key={item.id}>
                    <div className="border rounded p-2 d-flex align-items-center gap-3">
                      <div className="avatar-md flex-centered bg-light rounded-circle">
                        <Image src={avatar} alt={item.name} width={40} height={40} className="rounded-circle" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 text-muted">{item.name}</p>
                        <p className="fs-18 text-dark fw-medium">
                          {item.count} <span className="text-muted fs-14">({percent}%)</span>
                        </p>
                        <div className="progress" style={{ height: 10 }}>
                          <div
                            className={`progress-bar ${
                              chartMode === 'doctor' ? 'bg-primary' : 'bg-warning'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
          */}
        </CardBody>
      </Card>
    </Col>
  );
};

export default AppointmentsOverview;
