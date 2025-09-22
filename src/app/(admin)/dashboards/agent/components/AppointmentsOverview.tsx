'use client';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useMemo } from 'react';
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
import IconifyIcon from '@/components/wrappers/IconifyIcon';

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

const AppointmentsOverview = ({ upcoming }: AppointmentsOverviewProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All Doctors');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [chartMode, setChartMode] = useState<'doctor' | 'branch'>('doctor');
  const [loading] = useState(false);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const [distributionData, setDistributionData] = useState<AppointmentDistributionItem[]>([]);
  const [distributionTotal, setDistributionTotal] = useState<number>(0);

  const [dateFilter, setDateFilter] = useState<'all' | string>('all');

  const calendarRef = useRef<any>(null);

  // ✅ Compute start and end date based on dateFilter
  const { startDate, endDate } = useMemo(() => {
    const now = dayjs();
    switch (dateFilter) {
      case 'today':
        return { startDate: now.startOf('day').format('YYYY-MM-DD'), endDate: now.endOf('day').format('YYYY-MM-DD') };
      case 'this_week':
        return { startDate: now.startOf('week').format('YYYY-MM-DD'), endDate: now.endOf('week').format('YYYY-MM-DD') };
      case '15_days':
        return { startDate: now.subtract(15, 'day').format('YYYY-MM-DD'), endDate: now.format('YYYY-MM-DD') };
      case 'this_month':
        return { startDate: now.startOf('month').format('YYYY-MM-DD'), endDate: now.endOf('month').format('YYYY-MM-DD') };
      case 'this_year':
        return { startDate: now.startOf('year').format('YYYY-MM-DD'), endDate: now.endOf('year').format('YYYY-MM-DD') };
      default:
        return { startDate: now.startOf('year').format('YYYY-MM-DD'), endDate: now.endOf('year').format('YYYY-MM-DD') }; // fallback
    }
  }, [dateFilter]);

  // TODO: Map selectedDoctor/selectedBranch to IDs if needed
  const doctorId = selectedDoctor !== 'All Doctors' ? undefined : undefined;
  const branchId = selectedBranch !== 'All Branches' ? undefined : undefined;

  // ✅ Fetch appointment stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await getAppointmentStats({
          startDate,
          endDate,
          doctorId,
          branchId,
          timeFilter: dateFilter,
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
  }, [selectedDoctor, selectedBranch, startDate, endDate, dateFilter]);

  // ✅ Fetch appointment distribution
  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const response = await getAppointmentDistribution({
          startDate,
          endDate,
          doctorId,
          branchId,
          timeFilter: dateFilter,
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
  }, [selectedDoctor, selectedBranch, startDate, endDate, chartMode, dateFilter]);

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
                  onClick={() => setDateFilter(f.value)}
                  active={dateFilter === f.value}
                >
                  {f.label}
                </DropdownItem>
              ))}
              {dateFilter !== 'all' && (
                <DropdownItem
                  className="text-danger"
                  onClick={() => setDateFilter('all')}
                >
                  Clear Date Filter
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
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
        </CardBody>
      </Card>
    </Col>
  );
};

export default AppointmentsOverview;
