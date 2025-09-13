'use client';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Spinner,
} from 'react-bootstrap';

// Example avatars
import useCalendar from '@/app/(admin)/pages/calendar/useCalendar';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import Calendar from './Calendar';

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

const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Anima Corpus Namur'];

const CATEGORIES = [
  { id: 'consultation', name: 'Consultation', color: '#007bff' },
  { id: 'followup', name: 'Follow-up', color: '#28a745' },
  { id: 'therapy', name: 'Therapy', color: '#ffc107' },
  { id: 'surgery', name: 'Surgery', color: '#dc3545' },
];

const AppointmentsOverview = ({ upcoming }: AppointmentsOverviewProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All Doctors');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [chartMode, setChartMode] = useState<'doctor' | 'branch'>('doctor');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarHeight] = useState('750px');
  const [loading] = useState(false);

  const calendarRef = useRef<any>(null);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return upcoming.filter(
      (a) =>
        (selectedDoctor === 'All Doctors' || a.doctor === selectedDoctor) &&
        (selectedBranch === 'All Branches' || a.branch === selectedBranch),
    );
  }, [selectedDoctor, selectedBranch, upcoming]);

  // Aggregates
  const doctorMap: Record<string, number> = {};
  const branchMap: Record<string, number> = {};
  filteredAppointments.forEach((a) => {
    doctorMap[a.doctor] = (doctorMap[a.doctor] || 0) + 1;
    branchMap[a.branch] = (branchMap[a.branch] || 0) + 1;
  });
  const totalAppointments = filteredAppointments.length || 1;

  // Chart
  const chartCategories = chartMode === 'doctor' ? Object.keys(doctorMap) : Object.keys(branchMap);
  const chartData = chartCategories.map((key) =>
    chartMode === 'doctor' ? doctorMap[key] : branchMap[key],
  );

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

  // Dropdown lists
  const allDoctors = Array.from(new Set(upcoming.map((a) => a.doctor)));
  const allBranches = Array.from(new Set(upcoming.map((a) => a.branch)));

  // Calendar events
  const calendars = CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    color: '#fff',
    bgColor: c.color,
    dragBgColor: c.color,
    borderColor: c.color,
  }));

  const {
    createNewEvent,
    eventData,
    events,
    isEditable,
    onAddEvent,
    onCloseModal,
    onDateClick,
    onDrop,
    onEventClick,
    onEventDrop,
    onRemoveEvent,
    onUpdateEvent,
    show,
  } = useCalendar();

  return (
    <Col lg={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as="h4">Aperçu des rendez-vous</CardTitle>
            <p className="text-muted mb-0">Résumé hebdomadaire</p>
          </div>

          <div className="d-flex gap-2">
            {/* Doctor Dropdown */}
            <Dropdown>
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
            </Dropdown>

            {/* Branch Dropdown */}
            <Dropdown>
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
            </Dropdown>
          </div>
        </CardHeader>

        <CardBody>
          {/* Top Metrics */}
          <Row className="g-2 text-center mb-3">
            <Col lg={4}>
              <div className="border bg-light-subtle p-2 rounded">
                <p className="text-muted mb-1">Nombre total de rendez-vous</p>
                <h5 className="text-dark mb-1">{filteredAppointments.length}</h5>
              </div>
            </Col>
            <Col lg={4}>
              <div className="border bg-light-subtle p-2 rounded">
                <p className="text-muted mb-1">Completed</p>
                <h5 className="text-dark mb-1">
                  {filteredAppointments.filter((a) => a.status === 'COMPLETED').length}
                </h5>
              </div>
            </Col>
            <Col lg={4}>
              <div className="border bg-light-subtle p-2 rounded">
                <p className="text-muted mb-1">Annulations</p>
                <h5 className="text-dark mb-1">
                  {filteredAppointments.filter((a) => a.status === 'CANCELLED').length}
                </h5>
              </div>
            </Col>
          </Row>

          {/* Chart + Calendar */}
          <Row className="g-3">
            <Col lg={6}>
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={250}
              />
            </Col>

            <Col lg={6} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Calendar / List */}
              <div style={{ flex: 1, minHeight: 0 }}>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                ) : calendarViewMode === 'calendar' ? (
                  <Calendar
                    events={events}
                    onDateClick={onDateClick}
                    onDrop={onDrop}
                    onEventClick={onEventClick}
                    onEventDrop={onEventDrop}
                  />
                ) : (
                  <div
                    className="p-3 border rounded bg-white"
                    style={{ height: calendarHeight, overflowY: 'auto' }}
                  >
                    {filteredAppointments.length === 0 ? (
                      <p className="text-muted">Aucun rendez-vous trouvé.</p>
                    ) : (
                      filteredAppointments.map((appt) => (
                        <div key={appt.id} className="border-bottom py-2">
                          <strong>{appt.patient}</strong>
                          <div>
                            {dayjs(`${appt.date}T${appt.time}`).format('MMM D, YYYY h:mm A')}
                          </div>
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

          {/* Appointments Breakdown */}
          <h5 className="mt-4 mb-2 text-primary fw-bold">Répartition des rendez-vous</h5>
          <p className="text-muted mb-3">
            Affichage des rendez-vous pour <strong>{selectedDoctor}</strong>.
          </p>

          <Row className="g-3 mb-3">
            {Object.keys(doctorMap).map((doc, idx) => {
              const value = doctorMap[doc];
              const percent = Math.round((value / totalAppointments) * 100);
              const avatar = AVATARS[idx % AVATARS.length];
              return (
                <Col lg={3} key={doc}>
                  <div className="border rounded p-2 d-flex align-items-center gap-3">
                    <div className="avatar-md flex-centered bg-light rounded-circle">
                      <Image
                        src={avatar}
                        alt={doc}
                        width={40}
                        height={40}
                        className="rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 text-muted">{doc}</p>
                      <p className="fs-18 text-dark fw-medium">
                        {value} <span className="text-muted fs-14">({percent}%)</span>
                      </p>
                      <div className="progress" style={{ height: 10 }}>
                        <div className="progress-bar bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          <p className="text-muted">
            Affichage des rendez-vous pour <strong>{selectedBranch}</strong>.
          </p>
          <Row className="g-3">
            {Object.keys(branchMap).map((branch, idx) => {
              const value = branchMap[branch];
              const percent = Math.round((value / totalAppointments) * 100);
              const avatar = AVATARS[(idx + 2) % AVATARS.length];
              return (
                <Col lg={3} key={branch}>
                  <div className="border rounded p-2 d-flex align-items-center gap-3">
                    <div className="avatar-md flex-centered bg-light rounded-circle">
                      <Image
                        src={avatar}
                        alt={branch}
                        width={40}
                        height={40}
                        className="rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 text-muted">{branch}</p>
                      <p className="fs-18 text-dark fw-medium">
                        {value} <span className="text-muted fs-14">({percent}%)</span>
                      </p>
                      <div className="progress" style={{ height: 10 }}>
                        <div className="progress-bar bg-warning" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default AppointmentsOverview;
