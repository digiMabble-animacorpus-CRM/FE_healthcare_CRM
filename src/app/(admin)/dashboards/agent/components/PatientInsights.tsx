'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEffect, useState } from 'react';
import {
  Alert,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ProgressBar,
  Row,
  Spinner,
  ToggleButton,
} from 'react-bootstrap';
import { FaChild, FaFemale, FaMale } from 'react-icons/fa';
import type { BranchType } from '@/types/data';
import { API_BASE_PATH } from '@/context/constants';
import { getAllBranch } from '@/helpers/branch';

type Demographics = {
  gender: { male: number; female: number; other: number };
  ageBuckets: { label: string; value: number }[];
  topCities: { city: string; count: number }[];
};

const AgeDistributionWidget = ({
  ageBuckets,
}: {
  ageBuckets: { label: string; value: number }[];
}) => {
  const total = ageBuckets.reduce((sum, a) => sum + a.value, 0);

  const getIcon = (label: string) => {
    if (label.toLowerCase().includes('kid')) return FaChild;
    if (label.toLowerCase().includes('men')) return FaMale;
    if (
      label.toLowerCase().includes('woman') ||
      label.toLowerCase().includes('female')
    )
      return FaFemale;
    return FaChild; // fallback
  };

  return (
    <Row className="g-3">
      {ageBuckets.map((bucket) => {
        const percent = total ? Math.round((bucket.value / total) * 100) : 0;
        const Icon = getIcon(bucket.label);
        return (
          <Col lg={4} key={bucket.label}>
            <div className="border rounded p-3 d-flex align-items-center gap-3">
              <div className="avatar-md flex-centered bg-light rounded-circle">
                <Icon size={30} className="text-primary" />
              </div>
              <div className="flex-grow-1">
                <p className="mb-1 text-muted">{bucket.label}</p>
                <p className="fs-18 text-dark fw-medium">
                  {bucket.value} <span className="text-muted fs-14">({percent}%)</span>
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
  );
};

const PatientInsights = ({
  newPatientsWeek,
  newPatientsMonth,
  demographics,
  branches,
  selectedBranchId,
  onSelectBranch,
}: {
  newPatientsWeek: number;
  newPatientsMonth: number;
  demographics: Demographics;
  branches: BranchType[];
  selectedBranchId: string | 'all';
  onSelectBranch: (branchId: string | 'all') => void;
}) => {
  return (
    <Col xl={12} lg={12}>
      <Card>
        <CardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-center border-0 pb-1 gap-2">
          <div>
            <CardTitle>Points de vue des patients</CardTitle>
          </div>

          <ButtonGroup className="d-flex flex-wrap">
            <ToggleButton
              id="branch-all"
              type="radio"
              name="branch"
              variant={selectedBranchId === 'all' ? 'primary' : 'outline-primary'}
              checked={selectedBranchId === 'all'}
              value="all"
              onChange={(e) => onSelectBranch(e.currentTarget.value)}
              className="me-2 mb-2"
            >
              Tous
            </ToggleButton>
            {branches.map((branch) => (
              <ToggleButton
                id={`branch-${branch._id}`}
                key={branch._id}
                type="radio"
                name="branch"
                variant={selectedBranchId === branch._id ? 'primary' : 'outline-primary'}
                checked={selectedBranchId === branch._id}
                value={branch._id}
                onChange={(e) => onSelectBranch(e.currentTarget.value)}
                className="me-2 mb-2"
              >
                {branch.name}
              </ToggleButton>
            ))}
          </ButtonGroup>

          <Dropdown>
            <DropdownToggle
              as={'a'}
              className="btn btn-sm btn-outline-light rounded icons-center content-none"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Semaine{' '}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem>Semaine</DropdownItem>
              <DropdownItem>Mois</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>

        <CardBody>
          <Row className="mb-3 text-center">
            <Col>
              <div className="fw-semibold fs-4">{newPatientsWeek}</div>
              <div className="text-muted">Nouveaux patients (Semaine)</div>
            </Col>
            <Col>
              <div className="fw-semibold fs-4">{newPatientsMonth}</div>
              <div className="text-muted">Nouveaux patients (Mois)</div>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <div className="p-2 border rounded bg-light-subtle">
                <h6>Genre</h6>
                {Object.entries(demographics.gender).map(([key, value]) => (
                  <div className="mb-2" key={key}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span>{value}%</span>
                    </div>
                    <ProgressBar now={value} variant="primary" className="progress-sm rounded" />
                  </div>
                ))}
              </div>
            </Col>

            <Col md={6}>
              <div className="p-2 border rounded bg-light-subtle">
                <h6>La Succursale</h6>
                {demographics.topCities.map((c, idx) => (
                  <div className="mb-2" key={idx}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{c.city}</span>
                      <span>{c.count}</span>
                    </div>
                    <ProgressBar
                      now={
                        (c.count / Math.max(...demographics.topCities.map((t) => t.count))) *
                        100
                      }
                      variant="success"
                      className="progress-sm rounded"
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          <div className="p-2 border rounded bg-light-subtle">
            <h6>Répartition par âge</h6>
            <AgeDistributionWidget ageBuckets={demographics.ageBuckets} />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

const PatientInsightsContainer = () => {
  const [dashboardData, setDashboardData] = useState<{
    newPatientsWeek: number;
    newPatientsMonth: number;
    demographics: Demographics;
    rawData: any; // Store raw data for filtering
  } | null>(null);

  const [branches, setBranches] = useState<BranchType[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | 'all'>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBranches(getAllBranch());
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No access token found.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_PATH}/dashboard/patients`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          setError(`Failed to load data: ${response.status} ${errorText}`);
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (!result.status || !result.data) {
          setError('API returned unsuccessful status or empty data');
          setLoading(false);
          return;
        }

        setDashboardData({
          ...processData(result.data, selectedBranchId),
          rawData: result.data,
        });
      } catch (error) {
        setError('Error loading dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Recalculate filtered data when selectedBranchId or branches changes (client-side filtering)
  useEffect(() => {
    if (!dashboardData?.rawData) return;

    setDashboardData((prev) => {
      if (!prev) return prev;
      return {
        ...processData(prev.rawData, selectedBranchId),
        rawData: prev.rawData,
      };
    });
  }, [selectedBranchId]);

  // Processing function to filter and compute demographics
  function processData(data: any, branchId: string | 'all') {
    let filteredData = data;

    if (branchId !== 'all') {
      // Filter branch_distribution to selected branch only
      filteredData = {
        ...data,
        branch_distribution: (data.branch_distribution || []).filter(
          (item: any) => item.branch_id === branchId
        ),
      };
    }

    const totalGenderCount =
      (filteredData.gender_distribution?.male ?? 0) +
      (filteredData.gender_distribution?.female ?? 0) +
      (filteredData.gender_distribution?.other ?? 0);

    const genderPercentages = {
      male: totalGenderCount ? ((filteredData.gender_distribution?.male ?? 0) / totalGenderCount) * 100 : 0,
      female: totalGenderCount ? ((filteredData.gender_distribution?.female ?? 0) / totalGenderCount) * 100 : 0,
      other: totalGenderCount ? ((filteredData.gender_distribution?.other ?? 0) / totalGenderCount) * 100 : 0,
    };

    const demographics: Demographics = {
      gender: {
        male: Number(genderPercentages.male.toFixed(1)),
        female: Number(genderPercentages.female.toFixed(1)),
        other: Number(genderPercentages.other.toFixed(1)),
      },
      topCities: (filteredData.branch_distribution || [])
        .filter((item: any) => item.branch_name !== null)
        .map((item: any) => ({
          city: item.branch_name,
          count: Number(item.count),
        })),
      ageBuckets: (filteredData.age_distribution || []).map((item: any) => ({
        label: item.range,
        value: Number(item.count),
        percent: Number(item.percentage),
      })),
    };

    return {
      newPatientsWeek: filteredData.new_patients?.week ?? 0,
      newPatientsMonth: filteredData.new_patients?.month ?? 0,
      demographics,
    };
  }

  return (
    <>
      {loading ? (
        <Col xl={12} lg={12} className="text-center my-5">
          <Spinner animation="border" />
        </Col>
      ) : error ? (
        <Col xl={12} lg={12} className="my-5">
          <Alert variant="danger">{error}</Alert>
        </Col>
      ) : dashboardData ? (
        <PatientInsights
          newPatientsWeek={dashboardData.newPatientsWeek}
          newPatientsMonth={dashboardData.newPatientsMonth}
          demographics={dashboardData.demographics}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onSelectBranch={setSelectedBranchId}
        />
      ) : null}
    </>
  );
};

export default PatientInsightsContainer;
