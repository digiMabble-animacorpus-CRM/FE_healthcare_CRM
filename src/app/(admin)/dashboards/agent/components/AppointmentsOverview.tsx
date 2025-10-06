import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';

import { AppointmentStats, getAppointmentStats } from '@/helpers/dashboard';
import { getAllBranch } from '@/helpers/branch';

// types.ts or inside the same file

export type Appointment = {
  id: string;
  date: string;
  time: string;
  patient: string;
  doctor: string;
  branch: string;
  status: 'Programmé' | 'Terminée' | 'Annulée';
};
export type BranchType = { _id: string; name: string };
export type AppointmentsOverviewProps = {
  upcomingCount: number;
  cancellationsWeek: number;
  completedWeek: number;
  upcoming: Appointment[];
};

// Utility to chunk array into groups of 2
function chunk<T>(arr: T[], size = 2): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

// Cumulative "All Branches" card
const CumulativeAppointmentCard = ({ branchIds }: { branchIds: string[] }) => {
  const [timeFilter, setTimeFilter] = useState<'thisWeek' | 'lastWeek' | 'lastMonth'>('thisWeek');
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate date ranges depending on filter
  const startDate =
    timeFilter === 'thisWeek'
      ? dayjs().startOf('week').format('YYYY-MM-DD')
      : timeFilter === 'lastWeek'
        ? dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
        : dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
  const endDate =
    timeFilter === 'thisWeek'
      ? dayjs().endOf('week').format('YYYY-MM-DD')
      : timeFilter === 'lastWeek'
        ? dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
        : dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch for each branch and sum up stats
        const statsResults = await Promise.all(
          branchIds.map((branchId) =>
            getAppointmentStats({ startDate, endDate, branchId: Number(branchId) }),
          ),
        );
        // Aggregate stats from all branches
        const totals = statsResults.reduce(
          (acc, res) => {
            const stat = res?.stats || { totalAppointments: 0, completed: 0, cancellations: 0 };
            return {
              totalAppointments: acc.totalAppointments + (stat.totalAppointments || 0),
              completed: acc.completed + (stat.completed || 0),
              cancellations: acc.cancellations + (stat.cancellations || 0),
            };
          },
          { totalAppointments: 0, completed: 0, cancellations: 0 },
        );
        setAppointmentStats(totals);
      } finally {
        setLoading(false);
      }
    };
    if (branchIds.length) {
      fetchStats();
    }
  }, [startDate, endDate, branchIds]);

  return (
    <Col md={6} className="mb-4">
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as="h5">Tous</CardTitle>
            <p className="text-primary mb-0 small">Résumé cumulatif des rendez-vous</p>
          </div>
          <div role="group" className="d-flex gap-2">
            {(['thisWeek', 'lastWeek', 'lastMonth'] as const).map((period) => (
              <button
                key={period}
                type="button"
                className={`btn btn-sm ${timeFilter === period ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                onClick={() => setTimeFilter(period)}
              >
                {period === 'thisWeek'
                  ? 'This Week'
                  : period === 'lastWeek'
                    ? 'Last Week'
                    : 'Last Month'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          <Row className="text-center">
            <Col>
              <p className="text-muted mb-1">Programmé</p>
              <h5>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  (appointmentStats?.totalAppointments ?? 0)
                )}
              </h5>
            </Col>
            <Col>
              <p className="text-muted mb-1">Terminée</p>
              <h5>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  (appointmentStats?.completed ?? 0)
                )}
              </h5>
            </Col>
            <Col>
              <p className="text-muted mb-1">Annulée</p>
              <h5>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  (appointmentStats?.cancellations ?? 0)
                )}
              </h5>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

// Single-branch card (no change)
const BranchAppointmentCard = ({ branch, branchId }: { branch: string; branchId: string }) => {
  const [timeFilter, setTimeFilter] = useState<'thisWeek' | 'lastWeek' | 'lastMonth'>('thisWeek');
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(false);

  const startDate =
    timeFilter === 'thisWeek'
      ? dayjs().startOf('week').format('YYYY-MM-DD')
      : timeFilter === 'lastWeek'
        ? dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
        : dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
  const endDate =
    timeFilter === 'thisWeek'
      ? dayjs().endOf('week').format('YYYY-MM-DD')
      : timeFilter === 'lastWeek'
        ? dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
        : dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getAppointmentStats({ startDate, endDate, branchId: Number(branchId) });
        setAppointmentStats(res?.stats || null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [startDate, endDate, branchId]);

  return (
    <Col md={6} className="mb-4">
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as="h5">{branch}</CardTitle>
            <p className="text-muted mb-0 small">Résumé du rendez-vous</p>
          </div>
          <div role="group" className="d-flex gap-2">
            {(['thisWeek', 'lastWeek', 'lastMonth'] as const).map((period) => (
              <button
                key={period}
                type="button"
                className={`btn btn-sm ${timeFilter === period ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                onClick={() => setTimeFilter(period)}
              >
                {period === 'thisWeek'
                  ? 'This Week'
                  : period === 'lastWeek'
                    ? 'Last Week'
                    : 'Last Month'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          <Row className="text-center">
            <Col>
              <p className="text-muted mb-1">Programmé</p>
              <h5>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  (appointmentStats?.totalAppointments ?? 0)
                )}
              </h5>
            </Col>
            <Col>
              <p className="text-muted mb-1">Terminée</p>
              <h5>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  (appointmentStats?.completed ?? 0)
                )}
              </h5>
            </Col>
            <Col>
              <p className="text-muted mb-1">Annulée</p>
              <h5>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  (appointmentStats?.cancellations ?? 0)
                )}
              </h5>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

const AppointmentsOverview = ({ upcoming }: AppointmentsOverviewProps) => {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    const loadBranches = () => {
      const allBranches = getAllBranch();
      setBranches(allBranches);
      setLoadingBranches(false);
    };
    loadBranches();
  }, []);

  if (loadingBranches) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  // Group the branches into arrays of 2 for row rendering
  const branchRows = chunk(branches, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4" className="mb-0">
          Points de vue de Rendez-vous
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Render cumulative card first */}
          <CumulativeAppointmentCard branchIds={branches.map((b) => b._id)} />

          {/* Render all branch cards continuously after */}
          {branches.map((branch) => (
            <BranchAppointmentCard key={branch._id} branch={branch.name} branchId={branch._id} />
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

export default AppointmentsOverview;
